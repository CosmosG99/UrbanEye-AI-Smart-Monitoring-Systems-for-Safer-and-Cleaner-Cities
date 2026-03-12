const { execFile } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

function execFileAsync(cmd, args, options) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, options, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function runDetectOnBase64Jpeg({
  imageBase64,
  pythonBin,
  aiEngineDir
}) {
  if (!imageBase64) throw new Error("imageBase64 is required");

  const cleaned = imageBase64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(cleaned, "base64");

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "urbaneye-"));
  const imgPath = path.join(tmpDir, "frame.jpg");

  try {
    await fs.writeFile(imgPath, buffer);

    const detectPath = path.join(aiEngineDir, "detect.py");
    const { stdout } = await execFileAsync(
      pythonBin,
      [detectPath, "--input", imgPath, "--json"],
      { windowsHide: true, timeout: 120000, maxBuffer: 10 * 1024 * 1024 }
    );

    const text = String(stdout || "").trim();
    const jsonLine = text.split(/\r?\n/).filter(Boolean).slice(-1)[0] || "";
    const parsed = JSON.parse(jsonLine);
    return parsed;
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

module.exports = { runDetectOnBase64Jpeg };

