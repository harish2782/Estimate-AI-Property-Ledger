import React from "react";
import { NavLink } from "react-router-dom";

const ITEMS = [
  { idx: "01", to: "/", label: "Overview", end: true },
  { idx: "02", to: "/predict", label: "Price Prediction" },
  { idx: "03", to: "/valuate", label: "Property Valuation" },
  { idx: "04", to: "/recommend", label: "Recommendations" },
  { idx: "05", to: "/analytics", label: "Market Analytics" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">Est<span>imate</span></div>
        <div className="brand-sub">AI Property Ledger</div>
      </div>
      <ul className="nav-list">
        {ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
            >
              <span className="idx">{item.idx}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="sidebar-foot">
        v1.0 — Full-stack demo<br />
        React · Express · Flask ML
      </div>
    </aside>
  );
}
