/**
 * dataLayer.js
 * Simple data-access layer over the CSV dataset (house_data.csv).
 * Mirrors the "Data Layer: CSV / MongoDB / PostgreSQL" box in the
 * technical architecture diagram. CSV is used here for simplicity;
 * swap this module out for a Mongo/Postgres client without touching
 * route logic, since routes only call the functions exported here.
 */

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const CSV_PATH = path.join(__dirname, "..", "data", "house_data.csv");

let cache = null;

function loadDataset() {
  if (cache) return cache;
  const raw = fs.readFileSync(CSV_PATH, "utf-8");
  const records = parse(raw, { columns: true, skip_empty_lines: true });
  cache = records.map((r) => ({
    id: Number(r.id),
    area: Number(r.area),
    bedrooms: Number(r.bedrooms),
    bathrooms: Number(r.bathrooms),
    stories: Number(r.stories),
    parking: Number(r.parking),
    location: r.location,
    furnishing: r.furnishing,
    age_years: Number(r.age_years),
    amenities_score: Number(r.amenities_score),
    price: Number(r.price),
  }));
  return cache;
}

function getAll() {
  return loadDataset();
}

function getLocations() {
  const data = loadDataset();
  return [...new Set(data.map((d) => d.location))].sort();
}

module.exports = { getAll, getLocations };
