import React from "react";
import { recommendProperties } from "../api";
import { currency, LOCATIONS, FURNISHING_OPTIONS } from "../constants";

export default function Recommendation() {
  const [form, setForm] = React.useState({
    budget: 5000000,
    location: LOCATIONS[1],
    bedrooms: 3,
    bathrooms: 2,
    furnishing: FURNISHING_OPTIONS[1],
    parking: 1,
    top_n: 5,
  });
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const setField = (field, isNumeric) => (e) => {
    const raw = e.target.value;
    setForm((f) => ({ ...f, [field]: isNumeric ? Number(raw) : raw }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await recommendProperties(form);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-eyebrow">04 · Property Recommendation</div>
      <h1 className="page-title">Find comparable properties</h1>
      <p className="page-desc">
        Set a budget and preferences. The engine scores every property in the ledger against
        your inputs and returns the closest matches, ranked by match score.
      </p>

      <form className="card" onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div className="card-label">Preferences</div>
        <div className="form-row">
          <div className="field">
            <label>Budget (₹)</label>
            <input type="number" min="0" value={form.budget} onChange={setField("budget", true)} />
          </div>
          <div className="field">
            <label>Preferred location</label>
            <select value={form.location} onChange={setField("location", false)}>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Bedrooms</label>
            <input type="number" min="1" max="10" value={form.bedrooms} onChange={setField("bedrooms", true)} />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Bathrooms</label>
            <input type="number" min="1" max="10" value={form.bathrooms} onChange={setField("bathrooms", true)} />
          </div>
          <div className="field">
            <label>Furnishing</label>
            <select value={form.furnishing} onChange={setField("furnishing", false)}>
              {FURNISHING_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Parking spots</label>
            <input type="number" min="0" max="5" value={form.parking} onChange={setField("parking", true)} />
          </div>
        </div>
        <button className="btn btn-accent" type="submit" disabled={loading}>
          {loading ? "Searching…" : "Find Matches"}
        </button>
        {error && <div className="error-box">{error}</div>}
      </form>

      <div className="card">
        <div className="card-label">Top Recommended Properties</div>
        {!result && !loading && <div className="empty-state">Run a search to see recommended properties here.</div>}
        {loading && <div className="loading-text">Scoring the ledger…</div>}
        {result && (
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Location</th>
                <th>Price</th>
                <th>Furnishing</th>
                <th style={{ width: 140 }}>Match</th>
              </tr>
            </thead>
            <tbody>
              {result.recommendations.map((p) => (
                <tr key={p.id}>
                  <td>{p.bedrooms}BHK · {p.area} sqft</td>
                  <td>{p.location}</td>
                  <td className="mono">{currency(p.price)}</td>
                  <td>{p.furnishing}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="match-bar-track" style={{ flex: 1 }}>
                        <div className="match-bar-fill" style={{ width: `${p.match_score}%` }} />
                      </div>
                      <span className="mono" style={{ fontSize: 12 }}>{p.match_score}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
