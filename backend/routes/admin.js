/**
 * routes/admin.js
 * Admin / Data Utility (optional module)
 *   GET  /api/admin/metrics     -> view latest model metrics
 *   GET  /api/admin/logs        -> export/view request logs
 *   POST /api/admin/upload      -> upload a new dataset CSV (replaces house_data.csv)
 *   POST /api/admin/retrain     -> trigger retraining (calls python script)
 *
 * NOTE: retrain shells out to `python3 train_model.py` in ml_service/.
 * This is intentionally simple for a project/demo context (see spec:
 * "Out of Scope: Production deployment"). Add auth before using in prod.
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const multer = require("multer");

const router = express.Router();

const DATA_DIR = path.join(__dirname, "..", "data");
const ML_DIR = path.join(__dirname, "..", "..", "ml_service");
const METADATA_PATH = path.join(ML_DIR, "model", "metadata.json");
const LOG_PATH = path.join(DATA_DIR, "request.log");

const upload = multer({ dest: DATA_DIR });

router.get("/metrics", (req, res) => {
  try {
    const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, "utf-8"));
    return res.json(metadata);
  } catch (e) {
    return res.status(404).json({ error: "No metrics found. Train the model first." });
  }
});

router.get("/logs", (req, res) => {
  try {
    const logs = fs.existsSync(LOG_PATH) ? fs.readFileSync(LOG_PATH, "utf-8") : "";
    return res.type("text/plain").send(logs || "No logs yet.");
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/upload", upload.single("dataset"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded (field name: dataset)" });
  const destCsv = path.join(DATA_DIR, "house_data.csv");
  const mlCsv = path.join(ML_DIR, "house_data.csv");
  fs.copyFileSync(req.file.path, destCsv);
  fs.copyFileSync(req.file.path, mlCsv);
  fs.unlinkSync(req.file.path);
  return res.json({ message: "Dataset uploaded. Call /api/admin/retrain to retrain the model." });
});

router.post("/retrain", (req, res) => {
  execFile("python3", ["train_model.py"], { cwd: ML_DIR, timeout: 5 * 60 * 1000 }, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: "Retrain failed", detail: stderr || err.message });
    }
    return res.json({ message: "Retrain complete", output: stdout });
  });
});

module.exports = router;
