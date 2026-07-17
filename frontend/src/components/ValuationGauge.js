import React from "react";

/**
 * ValuationGauge — signature element.
 * A half-circle "appraiser's dial" that sweeps from Underpriced (left)
 * through Fair (center) to Overpriced (right), with a needle positioned
 * by the percentage difference between listed and predicted price.
 */
export default function ValuationGauge({ pctDiff, verdict }) {
  const clamped = Math.max(-30, Math.min(30, pctDiff));
  const angle = (clamped / 30) * 90; // -90..90 degrees across the arc
  const rad = ((angle - 90) * Math.PI) / 180;
  const cx = 150, cy = 150, r = 110;
  const needleX = cx + r * Math.cos(rad);
  const needleY = cy + r * Math.sin(rad);

  const verdictColor = verdict === "Overpriced" ? "#B4543E" : verdict === "Underpriced" ? "#2E6A8E" : "#4C7A5E";

  const arcSegments = [
    { color: "#2E6A8E", from: -90, to: -30 },
    { color: "#4C7A5E", from: -30, to: 30 },
    { color: "#B4543E", from: 30, to: 90 },
  ];

  const polarPoint = (deg, radius) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
  };

  const arcPath = (from, to, radius) => {
    const [x1, y1] = polarPoint(from, radius);
    const [x2, y2] = polarPoint(to, radius);
    const largeArc = Math.abs(to - from) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <svg viewBox="0 0 300 190" width="100%" height="auto" role="img" aria-label={`Valuation gauge: ${verdict}`}>
      {arcSegments.map((seg, i) => (
        <path
          key={i}
          d={arcPath(seg.from, seg.to, r)}
          stroke={seg.color}
          strokeWidth="14"
          fill="none"
          opacity="0.85"
          strokeLinecap="butt"
        />
      ))}
      {/* tick labels */}
      <text x={cx - r - 6} y={cy + 22} fontSize="10" fontFamily="IBM Plex Mono, monospace" fill="#5B6472">UNDER</text>
      <text x={cx - 18} y={cy - r + 4} fontSize="10" fontFamily="IBM Plex Mono, monospace" fill="#5B6472">FAIR</text>
      <text x={cx + r - 30} y={cy + 22} fontSize="10" fontFamily="IBM Plex Mono, monospace" fill="#5B6472">OVER</text>

      {/* needle */}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#14213D" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="7" fill="#14213D" />
      <circle cx={cx} cy={cy} r="3" fill={verdictColor} />

      <text x={cx} y={cy + 46} textAnchor="middle" fontSize="20" fontWeight="600" fontFamily="IBM Plex Mono, monospace" fill={verdictColor}>
        {pctDiff > 0 ? "+" : ""}{pctDiff.toFixed(1)}%
      </text>
    </svg>
  );
}
