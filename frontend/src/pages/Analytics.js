import React from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ScatterChart, Scatter, LineChart, Line, Cell,
} from "recharts";
import { getAnalytics } from "../api";
import { currency } from "../constants";

const BRASS = "#B98B3E";
const INK = "#14213D";
const SAGE = "#4C7A5E";
const CLAY = "#B4543E";

function corrColor(v) {
  if (v > 0.5) return SAGE;
  if (v > 0.15) return BRASS;
  if (v > -0.15) return "#9AA3B2";
  return CLAY;
}

export default function Analytics() {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    getAnalytics().then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="error-box">{error}</div>;
  if (!data) return <div className="loading-text">Loading market analytics…</div>;

  const bestModel = data.model_comparison && typeof data.model_comparison === "object"
    ? Object.entries(data.model_comparison).sort((a, b) => (b[1].R2 || 0) - (a[1].R2 || 0))[0]
    : null;

  return (
    <div>
      <div className="page-eyebrow">05 · Market Analytics</div>
      <h1 className="page-title">How the market — and the model — behave</h1>
      <p className="page-desc">
        Aggregated views across {data.dataset_size?.toLocaleString()} listings in the ledger,
        plus a comparison of the machine-learning algorithms considered for prediction.
      </p>

      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Listings analyzed</div>
          <div className="kpi-value">{data.dataset_size?.toLocaleString()}</div>
        </div>
        {bestModel && (
          <>
            <div className="kpi">
              <div className="kpi-label">Best model</div>
              <div className="kpi-value" style={{ fontSize: 15 }}>{bestModel[0]}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">R² score</div>
              <div className="kpi-value">{bestModel[1].R2?.toFixed(3)}</div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-label">Price Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.price_distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDD6C6" />
              <XAxis dataKey="range" hide />
              <YAxis tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
              <Tooltip />
              <Bar dataKey="count" fill={BRASS} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-label">Area vs Price</div>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDD6C6" />
              <XAxis dataKey="area" name="Area" tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
              <YAxis dataKey="price" name="Price" tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
              <Tooltip formatter={(v) => currency(v)} />
              <Scatter data={data.area_vs_price} fill={INK} opacity={0.55} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-label">Bedrooms vs Avg Price</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.bedrooms_vs_avg_price}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDD6C6" />
              <XAxis dataKey="bedrooms" tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
              <YAxis tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
              <Tooltip formatter={(v) => currency(v)} />
              <Line type="monotone" dataKey="avg_price" stroke={BRASS} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-label">Furnishing vs Price</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.furnishing_vs_price}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDD6C6" />
              <XAxis dataKey="furnishing" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} />
              <YAxis tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
              <Tooltip formatter={(v) => currency(v)} />
              <Bar dataKey="avg_price" fill={INK} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-label">Area-wise Comparison (avg price by location)</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.area_wise_comparison} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDD6C6" />
              <XAxis type="number" tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
              <YAxis type="category" dataKey="location" width={110} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => currency(v)} />
              <Bar dataKey="avg_price" fill={BRASS} radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-label">Correlation with Price</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.correlation_heatmap} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDD6C6" />
              <XAxis type="number" domain={[-1, 1]} tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
              <YAxis type="category" dataKey="feature" width={110} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="correlation_with_price" radius={[0, 2, 2, 0]}>
                {data.correlation_heatmap.map((entry, i) => (
                  <Cell key={i} fill={corrColor(entry.correlation_with_price)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-label">Model Comparison</div>
        {data.model_comparison && data.model_comparison.note ? (
          <div className="empty-state">{data.model_comparison.note}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>MAE</th>
                <th>MSE</th>
                <th>RMSE</th>
                <th>R² Score</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.model_comparison || {}).map(([name, m]) => (
                <tr key={name}>
                  <td>{name}{bestModel && bestModel[0] === name ? " ★" : ""}</td>
                  <td className="mono">{m.MAE?.toFixed(0)}</td>
                  <td className="mono">{m.MSE?.toFixed(0)}</td>
                  <td className="mono">{m.RMSE?.toFixed(0)}</td>
                  <td className="mono">{m.R2?.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
