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
  .then(() => console.log("MongoDB Connected Sucessfully"))
  .catch((err) => console.log(err));

const detectionSchema = new mongoose.Schema({
  people_count: { type: Number, required: true },
  litter: { type: Number, required: true },
  crowd_level: { type: String, required: true },
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
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const JWT_SECRET = process.env.JWT_SECRET || "urbaneye-dev-secret";

// Auth: sign up
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strong.test(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters and include upper, lower, number and symbol.",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, passwordHash });

    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: "2d" });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (e) {
    console.error("Signup error:", e);
    res.status(500).json({ error: "Failed to sign up" });
  }
});

// Auth: login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: "2d" });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Receive frame from React dashboard
app.post("/api/detect/frame", async (req, res) => {
  try {
    const { imageBase64, cameraId, cameraName } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Remove base64 header
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePath = path.join(__dirname, "frame.jpg");

    // Save image
    fs.writeFileSync(imagePath, base64Data, "base64");

    // Run YOLO detection
    const python = spawn("py", ["../ai-engine/detect.py", "--input", imagePath, "--json"], {
      cwd: __dirname,
    });

    let result = "";
    let errOut = "";
    let exitCode = null;

    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    python.stderr.on("data", (data) => {
      errOut += data.toString();
      console.error("Python error:", data.toString());
    });

    python.on("close", async (code) => {
      exitCode = code;

      try {
        // Ultralytics sometimes prints non-JSON logs; parse the last JSON-looking line.
        const lastJsonLine =
          result
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean)
            .reverse()
            .find((l) => l.startsWith("{") && l.endsWith("}")) || "";

        const json = JSON.parse(lastJsonLine);

        const peopleCount = Number(json.people_count ?? 0);
        const litterCount = Number(json.litter_count ?? 0);
        const crowdLevel = String(json.crowd_level ?? "LOW").toUpperCase();
        const avgConfidence = json.avg_confidence != null ? Number(json.avg_confidence) : null;

        // Persist detection for analytics
        try {
          const doc = new Detection({
            people_count: peopleCount,
            litter: litterCount,
            crowd_level: crowdLevel,
            cameraId: cameraId ? String(cameraId) : "default",
            cameraName: cameraName || "",
            avg_confidence: avgConfidence,
          });
          await doc.save();
        } catch (saveErr) {
          console.error("Failed to save detection:", saveErr);
        }

        res.json({
          peopleCount,
          litterCount,
          crowdLevel,
          avgConfidence,
        });
      } catch (err) {
        res.status(500).json({
          error: "Could not parse YOLO output as JSON",
          exitCode,
          stdout: result.trim().slice(0, 2000),
          stderr: errOut.trim().slice(0, 2000),
        });
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Detection failed" });
  }
});

// Endpoint used by the Python webcam runner
app.post("/crowd", async (req, res) => {
  try {
    const payload = req.body || {};
    const peopleCount = Number(payload.people_count ?? 0);
    const litterCount = Number(payload.litter ?? 0);
    const crowdLevel = String(payload.crowd_level ?? "LOW").toUpperCase();

    const doc = new Detection({
      people_count: peopleCount,
      litter: litterCount,
      crowd_level: crowdLevel,
      cameraId: payload.cameraId ? String(payload.cameraId) : "default",
      cameraName: payload.cameraName || "",
      avg_confidence: payload.avg_confidence != null ? Number(payload.avg_confidence) : null,
    });

    await doc.save();

    res.json({ message: "Data stored successfully" });
  } catch (e) {
    console.error("Error storing /crowd payload:", e);
    res.status(500).json({ error: "Failed to store detection" });
  }
});

// Daily analytics summary for current date
app.get("/api/analytics/summary", async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
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
          detections: { $sum: 1 },
          avgConfidence: { $avg: "$avg_confidence" },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const hourly = await Detection.aggregate(pipeline);

    let totalPeople = 0;
    let totalLitter = 0;
    let totalDetections = 0;
    let weightedConfSum = 0;
    let confCount = 0;

    let peakHour = null;
    let peakHourPeople = 0;

    hourly.forEach((h) => {
      totalPeople += h.totalPeople || 0;
      totalLitter += h.totalLitter || 0;
      totalDetections += h.detections || 0;

      if (h.avgConfidence != null) {
        weightedConfSum += h.avgConfidence * h.detections;
        confCount += h.detections;
      }

      if (h.totalPeople > peakHourPeople) {
        peakHourPeople = h.totalPeople;
        peakHour = h._id;
      }
    });

    const avgVisitorsPerDetection = totalDetections > 0 ? totalPeople / totalDetections : 0;
    const avgLitterPerDetection = totalDetections > 0 ? totalLitter / totalDetections : 0;

    // Cleanliness score: higher when litter per detection is low
    let cleanlinessScore = 100;
    if (avgLitterPerDetection > 0) {
      cleanlinessScore = Math.max(0, Math.min(100, (1 / avgLitterPerDetection) * 100));
    }

    const avgConfidence = confCount > 0 ? weightedConfSum / confCount : null;
    const modelAccuracyPercent = avgConfidence != null ? Math.round(avgConfidence * 100) : null;

    // Simple predicted max based on current peak
    const predictedMax = peakHourPeople > 0 ? Math.round(peakHourPeople * 1.2) : 0;

    res.json({
      date: now.toISOString().slice(0, 10),
      totalPeople,
      totalLitter,
      totalDetections,
      avgVisitorsPerDetection,
      avgLitterPerDetection,
      cleanlinessScore,
      peakHour, // 0-23
      peakHourPeople,
      predictedMax,
      avgConfidence,
      modelAccuracyPercent,
      hourly: hourly.map((h) => ({
        hour: h._id,
        totalPeople: h.totalPeople,
        totalLitter: h.totalLitter,
        detections: h.detections,
      })),
    });
  } catch (e) {
    console.error("Failed to compute analytics summary:", e);
    res.status(500).json({ error: "Failed to compute analytics summary" });
  }
});

app.listen(5000, () => {
  console.log("UrbanEye backend running on port 5000");
});