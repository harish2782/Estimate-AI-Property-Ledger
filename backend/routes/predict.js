/**
 * routes/predict.js
 * POST /api/predict
 * Proxies feature payload to the Python ML microservice and returns
 * the predicted price, model used, and confidence summary.
 *
 * Expected body:
 * {
 *   area, bedrooms, bathrooms, stories, parking,
 *   location, furnishing, age_years, amenities_score
 * }
 */

const express = require("express");
const axios = require("axios");

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

const REQUIRED_FIELDS = [
  "area", "bedrooms", "bathrooms", "stories", "parking",
  "location", "furnishing", "age_years", "amenities_score",
];

function validatePayload(body) {
  const missing = REQUIRED_FIELDS.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");
  return missing;
}

function priceCategory(price) {
  if (price < 2_000_000) return "Budget";
  if (price < 6_000_000) return "Mid-Range";
  if (price < 12_000_000) return "Premium";
  return "Luxury";
}

router.post("/", async (req, res) => {
  const missing = validatePayload(req.body || {});
  if (missing.length > 0) {
    return res.status(400).json({ error: "Missing required fields", missing });
  }

  try {
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, req.body, { timeout: 10000 });
    const { predicted_price, model_used, confidence } = mlResponse.data;

    return res.json({
      predicted_price,
      model_used,
      price_category: priceCategory(predicted_price),
      confidence_summary: confidence,
    });
  } catch (err) {
    const detail = err.response?.data?.error || err.message;
    return res.status(502).json({ error: "ML service error", detail });
  }
});

module.exports = router;
