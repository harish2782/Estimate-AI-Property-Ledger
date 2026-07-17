import React from "react";
import { LOCATIONS, FURNISHING_OPTIONS } from "../constants";

const DEFAULTS = {
  area: 1500,
  bedrooms: 3,
  bathrooms: 2,
  stories: 2,
  parking: 1,
  location: LOCATIONS[0],
  furnishing: FURNISHING_OPTIONS[1],
  age_years: 5,
  amenities_score: 5,
};

export function usePropertyForm(initial = {}) {
  const [values, setValues] = React.useState({ ...DEFAULTS, ...initial });

  const update = (field) => (e) => {
    const raw = e.target.value;
    const isNumeric = ["area", "bedrooms", "bathrooms", "stories", "parking", "age_years", "amenities_score"].includes(field);
    setValues((v) => ({ ...v, [field]: isNumeric ? Number(raw) : raw }));
  };

  return { values, update, setValues };
}

export default function PropertyForm({ values, update }) {
  return (
    <>
      <div className="form-row">
        <div className="field">
          <label>Area (sqft)</label>
          <input type="number" min="200" value={values.area} onChange={update("area")} />
        </div>
        <div className="field">
          <label>Bedrooms</label>
          <input type="number" min="1" max="10" value={values.bedrooms} onChange={update("bedrooms")} />
        </div>
        <div className="field">
          <label>Bathrooms</label>
          <input type="number" min="1" max="10" value={values.bathrooms} onChange={update("bathrooms")} />
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label>Stories</label>
          <input type="number" min="1" max="5" value={values.stories} onChange={update("stories")} />
        </div>
        <div className="field">
          <label>Parking spots</label>
          <input type="number" min="0" max="5" value={values.parking} onChange={update("parking")} />
        </div>
        <div className="field">
          <label>Property age (years)</label>
          <input type="number" min="0" max="80" value={values.age_years} onChange={update("age_years")} />
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label>Location</label>
          <select value={values.location} onChange={update("location")}>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Furnishing</label>
          <select value={values.furnishing} onChange={update("furnishing")}>
            {FURNISHING_OPTIONS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Amenities score (0–10)</label>
          <input type="number" min="0" max="10" value={values.amenities_score} onChange={update("amenities_score")} />
          <div className="hint">Pool, gym, security, garden, etc. combined</div>
        </div>
      </div>
    </>
  );
}
