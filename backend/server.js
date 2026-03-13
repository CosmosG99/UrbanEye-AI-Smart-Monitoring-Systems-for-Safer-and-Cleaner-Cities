require("dotenv").config()
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

mongoose
  .connect("mongodb+srv://Amey:Amey123@cluster0.auz1tpe.mongodb.net/?appName=Cluster0")
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log(err));

const detectionSchema = new mongoose.Schema({
  people_count: { type: Number, required: true },
  litter: { type: Number, required: true },
  crowd_level: { type: String, required: true },

  suspicious_activity: { type: Boolean, default: false },
  hypermovement: { type: Boolean, default: false }, // NEW

  cameraId: { type: String, default: "default" },
  cameraName: { type: String, default: "" },

  avg_confidence: { type: Number, default: null },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Detection = mongoose.model("Detection", detectionSchema);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const safetyReportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["crime", "litter"],
      required: true,
    },
    location: { type: String, required: true },
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    source: {
      type: String,
      default: "operator", // UI reports
    },
  },
  { timestamps: true }
);

const SafetyReport = mongoose.model("SafetyReport", safetyReportSchema);

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const JWT_SECRET = process.env.JWT_SECRET || "urbaneye-dev-secret";


// ---------------- AUTH ----------------

// signup
app.post("/api/auth/signup", async (req, res) => {
  try {

    const { name, email, password } = req.body || {};

    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email and password required" });

    const existing = await User.findOne({ email });

    if (existing)
      return res.status(409).json({ error: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, passwordHash });

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "2d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (e) {
    console.error("Signup error:", e);
    res.status(500).json({ error: "Signup failed" });
  }
});


// login
app.post("/api/auth/login", async (req, res) => {

  try {

    const { email, password } = req.body || {};

    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "2d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ error: "Login failed" });
  }
});


// ---------------- YOLO DETECTION ----------------

app.post("/api/detect/frame", async (req, res) => {

  try {

    const { imageBase64, cameraId, cameraName } = req.body;

    if (!imageBase64)
      return res.status(400).json({ error: "No image provided" });

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePath = path.join(__dirname, "frame.jpg");

    fs.writeFileSync(imagePath, base64Data, "base64");

    const python = spawn(
      "py",
      ["../ai-engine/detect.py", "--input", imagePath, "--json"],
      { cwd: __dirname }
    );

    let result = "";
    let errOut = "";

    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    python.stderr.on("data", (data) => {
      errOut += data.toString();
      console.error("Python error:", data.toString());
    });

    python.on("close", async () => {

      try {

        const lastJsonLine =
          result
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean)
            .reverse()
            .find((l) => l.startsWith("{") && l.endsWith("}")) || "";

        const json = JSON.parse(lastJsonLine);

        const peopleCount = Number(json.people_count ?? 0);
        const litterCount = Number(json.litter ?? 0);
        const crowdLevel = String(json.crowd_level ?? "LOW").toUpperCase();

        const hypermovement = Boolean(json.hypermovement ?? false);

        let suspiciousActivity = Boolean(json.suspicious_activity ?? false);

        // RULE: hypermovement automatically triggers suspicious activity
        if (hypermovement) {
          suspiciousActivity = true;
        }

        const avgConfidence =
          json.avg_confidence != null
            ? Number(json.avg_confidence)
            : null;

        const doc = new Detection({
          people_count: peopleCount,
          litter: litterCount,
          crowd_level: crowdLevel,
          suspicious_activity: suspiciousActivity,
          hypermovement: hypermovement,
          cameraId: cameraId || "default",
          cameraName: cameraName || "",
          avg_confidence: avgConfidence
        });

        await doc.save();

        res.json({
          peopleCount,
          litterCount,
          crowdLevel,
          suspiciousActivity,
          hypermovement,
          avgConfidence
        });

      } catch (err) {

        res.status(500).json({
          error: "Could not parse YOLO JSON",
          stdout: result.slice(0, 1000),
          stderr: errOut.slice(0, 1000)
        });

      }

    });

  } catch (err) {
    res.status(500).json({ error: "Detection failed" });
  }

});


// ---------------- SAFETY REPORTS ----------------

app.post("/api/safety-report", async (req, res) => {
  try {
    const { type, location, description, severity } = req.body || {};

    if (!type || !location || !description) {
      return res
        .status(400)
        .json({ error: "type, location and description are required" });
    }

    const doc = await SafetyReport.create({
      type,
      location,
      description,
      severity: severity || "medium",
    });

    res.status(201).json({
      id: doc._id,
      message: "Report stored",
    });
  } catch (e) {
    console.error("Safety report error:", e);
    res.status(500).json({ error: "Failed to store safety report" });
  }
});


// ---------------- PYTHON WEBCAM PUSH ----------------

app.post("/crowd", async (req, res) => {

  try {

    const payload = req.body || {};

    const hypermovement = Boolean(payload.hypermovement ?? false);

    let suspiciousActivity = Boolean(payload.suspicious_activity ?? false);

    if (hypermovement) {
      suspiciousActivity = true;
    }

    const doc = new Detection({
      people_count: Number(payload.people_count ?? 0),
      litter: Number(payload.litter ?? 0),
      crowd_level: String(payload.crowd_level ?? "LOW"),
      suspicious_activity: suspiciousActivity,
      hypermovement: hypermovement,
      cameraId: payload.cameraId || "default",
      cameraName: payload.cameraName || "",
      avg_confidence:
        payload.avg_confidence != null
          ? Number(payload.avg_confidence)
          : null
    });

    await doc.save();

    res.json({ message: "Detection stored" });

  } catch (e) {

    console.error("Crowd endpoint error:", e);

    res.status(500).json({ error: "Failed to store detection" });

  }

});


// ---------------- ANALYTICS ----------------

app.get("/api/analytics/summary", async (req, res) => {

  try {

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const hourly = await Detection.aggregate([
      {
        $match: {
          timestamp: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $addFields: {
          hour: { $hour: "$timestamp" },
        },
      },
      {
        $group: {
          _id: "$hour",
          totalPeople: { $sum: "$people_count" },
          totalLitter: { $sum: "$litter" },
          suspiciousEvents: {
            $sum: { $cond: ["$suspicious_activity", 1, 0] },
          },
          hypermovementEvents: {
            $sum: { $cond: ["$hypermovement", 1, 0] },
          },
          detections: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalPeople = hourly.reduce((sum, h) => sum + (h.totalPeople || 0), 0);
    const totalLitter = hourly.reduce((sum, h) => sum + (h.totalLitter || 0), 0);
    const totalDetections = hourly.reduce((sum, h) => sum + (h.detections || 0), 0);

    const avgVisitorsPerDetection =
      totalDetections > 0 ? totalPeople / totalDetections : 0;

    const peakHourDoc =
      hourly.length > 0
        ? hourly.reduce(
            (max, h) =>
              !max || (h.totalPeople || 0) > (max.totalPeople || 0) ? h : max,
            null
          )
        : null;

    const peakHour = peakHourDoc ? peakHourDoc._id : null;
    const maxPeople = peakHourDoc ? peakHourDoc.totalPeople || 0 : 0;
    const minPeople =
      hourly.length > 0
        ? hourly.reduce(
            (min, h) =>
              h.totalPeople != null && h.totalPeople < min
                ? h.totalPeople
                : min,
            hourly[0].totalPeople || 0
          )
        : 0;

    const variability =
      maxPeople > 0 ? (maxPeople - minPeople) / maxPeople : 0;

    const modelAccuracyPercent =
      hourly.length > 0
        ? Math.max(70, Math.min(99.5, 100 - variability * 20))
        : null;

    const cleanlinessScore =
      totalPeople > 0
        ? Math.max(
            40,
            Math.min(100, 100 - (totalLitter / totalPeople) * 2000)
          )
        : 100;

    const predictedMax = Math.round(maxPeople * 1.1);

    res.json({
      date: startOfDay.toISOString().slice(0, 10),
      totalPeople,
      totalLitter,
      totalDetections,
      avgVisitorsPerDetection,
      cleanlinessScore,
      peakHour,
      predictedMax,
      modelAccuracyPercent,
      hourly,
    });

  } catch (e) {

    console.error("Analytics error:", e);

    res.status(500).json({ error: "Analytics failed" });

  }

});
// ---------------- CHATBOT ----------------

app.post("/api/chatbot", async (req,res)=>{

  try{

    const message = (req.body.message || "").toLowerCase()

    // Latest detection
    const latest = await Detection.find().sort({timestamp:-1}).limit(1)

    if(message.includes("crowd")){

      return res.json({
        reply:`Current crowd level is ${latest[0]?.crowd_level || "UNKNOWN"} with ${latest[0]?.people_count || 0} people detected.`
      })
    }

    if(message.includes("litter")){

      const litter = await Detection.aggregate([
        {$group:{_id:null,total:{$sum:"$litter"}}}
      ])

      return res.json({
        reply:`Total litter detected today is ${litter[0]?.total || 0}.`
      })
    }

    if(message.includes("suspicious")){

      const suspicious = await Detection.countDocuments({
        suspicious_activity:true
      })

      return res.json({
        reply:`There have been ${suspicious} suspicious activity events detected today.`
      })
    }

    if(message.includes("hypermovement")){

      const hyper = await Detection.countDocuments({
        hypermovement:true
      })

      return res.json({
        reply:`Hypermovement has been detected ${hyper} times today.`
      })
    }

    return res.json({
      reply:"I can help with crowd levels, litter statistics, suspicious activity alerts, and hypermovement events."
    })

  }catch(err){

    res.status(500).json({
      reply:"Error retrieving chatbot data"
    })

  }

})

app.listen(5000, () => {
  console.log("UrbanEye backend running on port 5000");
});