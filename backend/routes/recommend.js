/**
 * routes/recommend.js
 * POST /api/recommend
 * Module 3 - Property Recommendation
 * Recommends similar properties from the dataset based on user
 * preferences (budget, location, bedrooms/bathrooms, furnishing, parking).
 * Uses a simple weighted-distance similarity score (content-based filtering).
 *
 * Expected body:
 * {
 *   budget, location, bedrooms, bathrooms, furnishing, parking, top_n?
 * }
 */

const express = require("express");
const { getAll } = require("../data/dataLayer");

const router = express.Router();

function normalize(value, min, max) {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

router.post("/", (req, res) => {
  const {
    budget,
    location,
    bedrooms,
    bathrooms,
    furnishing,
    parking,
    top_n = 5,
  } = req.body || {};

  if (!budget) {
    return res.status(400).json({ error: "budget is required" });
  }

  const data = getAll();
  const prices = data.map((d) => d.price);
  const areas = data.map((d) => d.area);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minArea = Math.min(...areas);
  const maxArea = Math.max(...areas);

  const scored = data.map((property) => {
    let score = 0;
    let maxScore = 0;

    // Price closeness to budget (weight 0.4)
    const priceDiffNorm = 1 - Math.min(1, Math.abs(property.price - budget) / (maxPrice - minPrice));
    score += priceDiffNorm * 0.4;
    maxScore += 0.4;

    // Location match (weight 0.25)
    if (location) {
      score += (property.location.toLowerCase() === String(location).toLowerCase() ? 1 : 0) * 0.25;
      maxScore += 0.25;
    }

    // Bedrooms match (weight 0.15)
    if (bedrooms !== undefined) {
      const bedScore = 1 - Math.min(1, Math.abs(property.bedrooms - bedrooms) / 5);
      score += bedScore * 0.15;
      maxScore += 0.15;
    }

    // Bathrooms match (weight 0.1)
    if (bathrooms !== undefined) {
      const bathScore = 1 - Math.min(1, Math.abs(property.bathrooms - bathrooms) / 5);
      score += bathScore * 0.1;
      maxScore += 0.1;
    }

    // Furnishing match (weight 0.05)
    if (furnishing) {
      score += (property.furnishing.toLowerCase() === String(furnishing).toLowerCase() ? 1 : 0) * 0.05;
      maxScore += 0.05;
    }

    // Parking match (weight 0.05)
    if (parking !== undefined) {
      const parkScore = 1 - Math.min(1, Math.abs(property.parking - parking) / 3);
      score += parkScore * 0.05;
      maxScore += 0.05;
    }

    const matchPct = maxScore > 0 ? (score / maxScore) * 100 : 0;

    return { ...property, match_score: Math.round(matchPct * 10) / 10 };
  });

  scored.sort((a, b) => b.match_score - a.match_score);
  const top = scored.slice(0, Math.min(Number(top_n) || 5, 20));

  return res.json({
    query: { budget, location, bedrooms, bathrooms, furnishing, parking },
    count: top.length,
    recommendations: top.map((p) => ({
      id: p.id,
      area: p.area,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      stories: p.stories,
      parking: p.parking,
      location: p.location,
      furnishing: p.furnishing,
      age_years: p.age_years,
      amenities_score: p.amenities_score,
      price: p.price,
      match_score: p.match_score,
      feature_summary: `${p.bedrooms}BHK, ${p.area} sqft, ${p.location}, ${p.furnishing}`,
    })),
  });
});

module.exports = router;
