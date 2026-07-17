/**
 * routes/valuate.js
 * POST /api/valuate
 * Module 2 - Property Valuation
 * Compares predicted price (fetched from ML service via /api/predict logic)
 * against the actual listed price and returns a verdict.
 *
 * Expected body: same feature fields as /api/predict PLUS `listed_price`.
 */

const express = require("express");
const axios = require("axios");

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

const THRESHOLD_PCT = 8; // +/- 8% considered "Fair"

router.post("/", async (req, res) => {
  const { listed_price, ...features } = req.body || {};

  if (listed_price === undefined || listed_price === null || listed_price === "") {
    return res.status(400).json({ error: "listed_price is required" });
  }

  try {
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, features, { timeout: 10000 });
    const predicted = mlResponse.data.predicted_price;
    const listed = Number(listed_price);

    const diff = listed - predicted;
    const pctDiff = (diff / predicted) * 100;

    let verdict;
    if (pctDiff > THRESHOLD_PCT) verdict = "Overpriced";
    else if (pctDiff < -THRESHOLD_PCT) verdict = "Underpriced";
    else verdict = "Fair";

    let explanation;
    if (verdict === "Overpriced") {
      explanation = `Listed price is about ${pctDiff.toFixed(1)}% above the model's predicted fair value.`;
    } else if (verdict === "Underpriced") {
      explanation = `Listed price is about ${Math.abs(pctDiff).toFixed(1)}% below the model's predicted fair value - potentially a good deal.`;
    } else {
      explanation = `Listed price is within ${THRESHOLD_PCT}% of the model's predicted fair value - considered a fair price.`;
    }

    return res.json({
      predicted_price: Math.round(predicted * 100) / 100,
      actual_listed_price: listed,
      verdict,
      difference_amount: Math.round(diff * 100) / 100,
      percentage_difference: Math.round(pctDiff * 100) / 100,
      explanation,
    });
  } catch (err) {
    const detail = err.response?.data?.error || err.message;
    return res.status(502).json({ error: "ML service error", detail });
  }
});

module.exports = router;
