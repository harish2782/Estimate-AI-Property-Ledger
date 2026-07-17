import React from "react";
import PropertyForm, { usePropertyForm } from "../components/PropertyForm";
import ValuationGauge from "../components/ValuationGauge";
import { valuateProperty } from "../api";
import { currency } from "../constants";

const badgeClass = { Overpriced: "badge-over", Underpriced: "badge-under", Fair: "badge-fair" };

export default function Valuation() {
  const { values, update, setValues } = usePropertyForm();
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const listedPrice = values.listed_price ?? 6000000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await valuateProperty({ ...values, listed_price: listedPrice });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-eyebrow">03 · Property Valuation</div>
      <h1 className="page-title">Is this listing priced fairly?</h1>
      <p className="page-desc">
        Enter the property's features and its actual listed price. The model compares the
        two and returns a verdict — overpriced, fair, or underpriced — with an explanation.
      </p>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <form className="card" onSubmit={handleSubmit}>
          <div className="card-label">Property Features</div>
          <PropertyForm values={values} update={update} />

          <div className="field">
            <label>Actual listed price (₹)</label>
            <input
              type="number"
              min="0"
              value={listedPrice}
              onChange={(e) => setValues((v) => ({ ...v, listed_price: Number(e.target.value) }))}
            />
          </div>

          <button className="btn btn-accent" type="submit" disabled={loading}>
            {loading ? "Evaluating…" : "Evaluate Listing"}
          </button>
          {error && <div className="error-box">{error}</div>}
        </form>

        <div className="card">
          <div className="card-label">Valuation Verdict</div>
          {!result && !loading && (
            <div className="empty-state">Submit the form to see the valuation verdict here.</div>
          )}
          {loading && <div className="loading-text">Comparing against predicted value…</div>}
          {result && (
            <div>
              <ValuationGauge pctDiff={result.percentage_difference} verdict={result.verdict} />
              <div style={{ textAlign: "center", marginTop: -6, marginBottom: 16 }}>
                <span className={`badge ${badgeClass[result.verdict]}`}>{result.verdict}</span>
              </div>
              <div className="divider" />
              <table>
                <tbody>
                  <tr>
                    <td style={{ color: "var(--slate)" }}>Predicted price</td>
                    <td className="mono">{currency(result.predicted_price)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--slate)" }}>Listed price</td>
                    <td className="mono">{currency(result.actual_listed_price)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--slate)" }}>Difference</td>
                    <td className="mono">{currency(result.difference_amount)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="divider" />
              <p style={{ fontSize: 13, color: "var(--slate)", lineHeight: 1.55 }}>{result.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
