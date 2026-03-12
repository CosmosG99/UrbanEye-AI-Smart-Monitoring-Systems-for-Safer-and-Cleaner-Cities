require("dotenv").config();

const path = require("node:path");
const express = require("express");
const cors = require("cors");

const { connectToMongo } = require("./db");
const Detection = require("./models/Detection");
const { runDetectOnBase64Jpeg } = require("./detectRunner");

const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const PYTHON_BIN = process.env.PYTHON_BIN || "python";

const repoRoot = path.resolve(__dirname, "..", "..");
const AI_ENGINE_DIR = path.resolve(repoRoot, process.env.AI_ENGINE_DIR || "./ai-engine");

async function main() {
  await connectToMongo(MONGO_URI);

  const app = express();
  app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "6mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/detect/frame", async (req, res) => {
    try {
      const { imageBase64, cameraId, cameraName } = req.body || {};

      const result = await runDetectOnBase64Jpeg({
        imageBase64,
        pythonBin: PYTHON_BIN,
        aiEngineDir: AI_ENGINE_DIR
      });

      const doc = await Detection.create({
        cameraId: cameraId || "default",
        cameraName: cameraName || "",
        peopleCount: Number(result.people_count ?? 0),
        litterCount: Number(result.litter_count ?? 0),
        crowdLevel: String(result.crowd_level ?? "LOW").toUpperCase(),
        meta: { source: "frame" }
      });

      res.json({
        peopleCount: doc.peopleCount,
        litterCount: doc.litterCount,
        crowdLevel: doc.crowdLevel,
        createdAt: doc.createdAt
      });
    } catch (e) {
      const message = e?.message || "Detection failed";
      res.status(500).json({ error: message });
    }
  });

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`UrbanEye server listening on ${PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

