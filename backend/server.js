const express = require("express")
const cors = require("cors")
const fs = require("fs")
const { spawn } = require("child_process")
const path = require("path")
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://Amey:Amey123@cluster0.auz1tpe.mongodb.net/?appName=Cluster0")
.then(()=>console.log("MongoDB Connected Sucessfully"))
.catch(err=>console.log(err));
const app = express()

app.use(cors())
app.use(express.json({ limit: "10mb" }))

// Receive frame from React dashboard
app.post("/api/detect/frame", async (req, res) => {

  try {

    const { imageBase64 } = req.body

    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided" })
    }

    // Remove base64 header
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "")

    const imagePath = path.join(__dirname, "frame.jpg")

    // Save image
    fs.writeFileSync(imagePath, base64Data, "base64")

    // Run YOLO detection
    const python = spawn("py", ["../ai-engine/detect.py", "--input", imagePath, "--json"], {
      cwd: __dirname
    })

    let result = ""
    let errOut = ""
    let exitCode = null

    python.stdout.on("data", (data) => {
      result += data.toString()
    })

    python.stderr.on("data", (data) => {
      errOut += data.toString()
      console.error("Python error:", data.toString())
    })

    python.on("close", (code) => {
      exitCode = code

      try {

        // Ultralytics sometimes prints non-JSON logs; parse the last JSON-looking line.
        const lastJsonLine =
          result
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean)
            .reverse()
            .find((l) => l.startsWith("{") && l.endsWith("}")) || ""

        const json = JSON.parse(lastJsonLine)

        res.json({
          peopleCount: Number(json.people_count ?? 0),
          litterCount: Number(json.litter_count ?? 0),
          crowdLevel: String(json.crowd_level ?? "LOW").toUpperCase()
        })

      } catch (err) {

        res.status(500).json({
          error: "Could not parse YOLO output as JSON",
          exitCode,
          stdout: result.trim().slice(0, 2000),
          stderr: errOut.trim().slice(0, 2000)
        })

      }

    })

  } catch (err) {

    res.status(500).json({ error: "Detection failed" })

  }

})

app.listen(5000, () => {
  console.log("UrbanEye backend running on port 5000")
})

const detectionSchema = new mongoose.Schema({
    people_count: Number,
    litter: Number,
    crowd_level: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Detection = mongoose.model("Detection", detectionSchema);

app.post("/crowd", async (req,res)=>{

  const data = new Detection(req.body);

  await data.save();

  res.json({message:"Data stored successfully"});
});