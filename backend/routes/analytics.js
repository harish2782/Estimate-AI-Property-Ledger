/**
 * routes/analytics.js
 * GET /api/analytics
 * Module 4 - Analytics Dashboard
 * Returns aggregated data for: price distribution, area vs price,
 * bedrooms vs avg price, furnishing vs price, area-wise comparison,
 * correlation heatmap, feature importance, model comparison.
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const { getAll } = require("../data/dataLayer");

const router = express.Router();
const METADATA_PATH = path.join(__dirname, "..", "..", "ml_service", "model", "metadata.json");

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function pearsonCorrelation(x, y) {
  const n = x.length;
  const mx = mean(x);
  const my = mean(y);
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom === 0 ? 0 : num / denom;
}

router.get("/", (req, res) => {
  const data = getAll();

  // 1. Price distribution (histogram buckets)
  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const bucketCount = 10;
  const bucketSize = (maxPrice - minPrice) / bucketCount;
  const priceDistribution = Array.from({ length: bucketCount }, (_, i) => {
    const lower = minPrice + i * bucketSize;
    const upper = lower + bucketSize;
    const count = prices.filter((p) => p >= lower && (i === bucketCount - 1 ? p <= upper : p < upper)).length;
    return { range: `${Math.round(lower)}-${Math.round(upper)}`, count };
  });

  // 2. Area vs Price (sampled scatter points, capped for payload size)
  const areaVsPrice = data
    .filter((_, idx) => idx % 5 === 0)
    .map((d) => ({ area: d.area, price: d.price }));

  // 3. Bedrooms vs Avg Price
  const bedroomGroups = {};
  data.forEach((d) => {
    if (!bedroomGroups[d.bedrooms]) bedroomGroups[d.bedrooms] = [];
    bedroomGroups[d.bedrooms].push(d.price);
  });
  const bedroomsVsAvgPrice = Object.entries(bedroomGroups)
    .map(([bedrooms, prices2]) => ({
      bedrooms: Number(bedrooms),
      avg_price: Math.round(mean(prices2)),
    }))
    .sort((a, b) => a.bedrooms - b.bedrooms);

  // 4. Furnishing vs Price
  const furnishingGroups = {};
  data.forEach((d) => {
    if (!furnishingGroups[d.furnishing]) furnishingGroups[d.furnishing] = [];
    furnishingGroups[d.furnishing].push(d.price);
  });
  const furnishingVsPrice = Object.entries(furnishingGroups).map(([furnishing, prices2]) => ({
    furnishing,
    avg_price: Math.round(mean(prices2)),
  }));

  // 5. Area-wise (location) comparison
  const locationGroups = {};
  data.forEach((d) => {
    if (!locationGroups[d.location]) locationGroups[d.location] = [];
    locationGroups[d.location].push(d.price);
  });
  const areaWiseComparison = Object.entries(locationGroups)
    .map(([location, prices2]) => ({
      location,
      avg_price: Math.round(mean(prices2)),
      count: prices2.length,
    }))
    .sort((a, b) => b.avg_price - a.avg_price);

  // 6. Correlation heatmap (numeric features vs price)
  const numericFields = ["area", "bedrooms", "bathrooms", "stories", "parking", "age_years", "amenities_score"];
  const correlationHeatmap = numericFields.map((field) => ({
    feature: field,
    correlation_with_price: Math.round(
      pearsonCorrelation(data.map((d) => d[field]), data.map((d) => d.price)) * 1000
    ) / 1000,
  }));

  // 7. Feature importance + 8. Model comparison -> pulled from ML metadata.json if available
  let featureImportance = [];
  let modelComparison = null;
  try {
    const metadataRaw = fs.readFileSync(METADATA_PATH, "utf-8");
    const metadata = JSON.parse(metadataRaw);
    modelComparison = metadata.comparison;

    // approximate feature importance using correlation magnitude if the
    // trained model doesn't directly expose it over this API boundary
    featureImportance = correlationHeatmap
      .map((c) => ({ feature: c.feature, importance: Math.abs(c.correlation_with_price) }))
      .sort((a, b) => b.importance - a.importance);
  } catch (e) {
    modelComparison = { note: "Run ml_service/train_model.py to generate model comparison metrics." };
  }

  return res.json({
    price_distribution: priceDistribution,
    area_vs_price: areaVsPrice,
    bedrooms_vs_avg_price: bedroomsVsAvgPrice,
    furnishing_vs_price: furnishingVsPrice,
    area_wise_comparison: areaWiseComparison,
    correlation_heatmap: correlationHeatmap,
    feature_importance: featureImportance,
    model_comparison: modelComparison,
    dataset_size: data.length,
  });
});

module.exports = router;
