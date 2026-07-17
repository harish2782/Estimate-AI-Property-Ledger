/**
 * server.js
 * Express backend entry point.
 * Wires up middleware, routes, and simple request logging.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const predictRoutes = require("./routes/predict");
const valuateRoutes = require("./routes/valuate");
const recommendRoutes = require("./routes/recommend");
const analyticsRoutes = require("./routes/analytics");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// simple request logger -> data/request.log (used by /api/admin/logs)
const LOG_PATH = path.join(__dirname, "data", "request.log");
app.use((req, res, next) => {
  const line = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}\n`;
  fs.appendFile(LOG_PATH, line, () => {});
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "AI Real Estate Price Prediction, Valuation & Recommendation System API",
    endpoints: [
      "POST /api/predict",
      "POST /api/valuate",
      "POST /api/recommend",
      "GET  /api/analytics",
      "GET  /api/admin/metrics",
      "GET  /api/admin/logs",
      "POST /api/admin/upload",
      "POST /api/admin/retrain",
    ],
  });
});

app.use("/api/predict", predictRoutes);
app.use("/api/valuate", valuateRoutes);
app.use("/api/recommend", recommendRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);

// fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend API listening on http://localhost:${PORT}`);
});
