import React from "react";
import PropertyForm, { usePropertyForm } from "../components/PropertyForm";
import { predictPrice } from "../api";
import { currency } from "../constants";

export default function PricePrediction() {
  const { values, update } = usePropertyForm();
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await predictPrice(values);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-eyebrow">02 · Price Prediction</div>
      <h1 className="page-title">What should this property cost?</h1>
      <p className="page-desc">
        Enter a property's features and the model returns a predicted market price,
        the algorithm used, and a price category.
      </p>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <form className="card" onSubmit={handleSubmit}>
          <div className="card-label">Property Features</div>
          <PropertyForm values={values} update={update} />
          <button className="btn btn-accent" type="submit" disabled={loading}>
            {loading ? "Predicting…" : "Predict Price"}
          </button>
          {error && <div className="error-box">{error}</div>}
        </form>

        <div className="card">
          <div className="card-label">Predicted Result</div>
          {!result && !loading && (
            <div className="empty-state">Fill in the form and run a prediction to see results here.</div>
          )}
          {loading && <div className="loading-text">Running inference…</div>}
          {result && (
            <div>
              <div className="figure figure-xl" style={{ color: "var(--ink)" }}>
                {currency(result.predicted_price)}
              </div>
              <div style={{ margin: "14px 0" }}>
                <span className="badge badge-fair">{result.price_category}</span>
              </div>
              <div className="divider" />
              <table>
                <tbody>
                  <tr>
                    <td style={{ color: "var(--slate)" }}>Model used</td>
                    <td className="mono">{result.model_used}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--slate)" }}>Confidence</td>
                    <td className="mono">{result.confidence_summary}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
