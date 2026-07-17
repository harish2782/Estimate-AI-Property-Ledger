import React from "react";
import { Link } from "react-router-dom";

const MODULES = [
  {
    idx: "02",
    title: "Price Prediction",
    to: "/predict",
    desc: "Estimate a fair market price for a property from its features — area, rooms, location, furnishing, and amenities.",
  },
  {
    idx: "03",
    title: "Property Valuation",
    to: "/valuate",
    desc: "Compare a listed price against the model's estimate to see whether a property is overpriced, fair, or underpriced.",
  },
  {
    idx: "04",
    title: "Recommendations",
    to: "/recommend",
    desc: "Find similar properties in the ledger, ranked by how closely they match a budget and set of preferences.",
  },
  {
    idx: "05",
    title: "Market Analytics",
    to: "/analytics",
    desc: "Explore price distribution, area comparisons, correlations, and how the underlying ML models stack up.",
  },
];

export default function Dashboard() {
  return (
    <div>
      <div className="page-eyebrow">01 · Product Overview</div>
      <h1 className="page-title">An AI-driven read on what a property is really worth</h1>
      <p className="page-desc">
        Estimate predicts prices, flags over- or under-priced listings, recommends comparable
        properties, and surfaces area-wise market patterns — for buyers, sellers, analysts,
        and anyone evaluating a listing.
      </p>

      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Target users</div>
          <div className="kpi-value" style={{ fontSize: 15 }}>Buyers · Sellers · Analysts</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Core method</div>
          <div className="kpi-value" style={{ fontSize: 15 }}>Supervised regression</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Architecture</div>
          <div className="kpi-value" style={{ fontSize: 15 }}>React · Express · Flask</div>
        </div>
      </div>

      <div className="grid grid-2">
        {MODULES.map((m) => (
          <Link key={m.to} to={m.to} style={{ textDecoration: "none" }}>
            <div className="card" style={{ height: "100%", cursor: "pointer" }}>
              <div className="card-label">Module {m.idx}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, margin: "0 0 8px", color: "var(--ink)" }}>
                {m.title}
              </h3>
              <p style={{ fontSize: 13.5, color: "var(--slate)", lineHeight: 1.55, margin: 0 }}>{m.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
