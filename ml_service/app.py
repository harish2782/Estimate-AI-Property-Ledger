"""
app.py - ML Service (Flask)
Serves the trained house-price model over a REST API.

Endpoints:
    POST /predict          -> predict house price from feature payload
    GET  /health            -> health check
    GET  /model-info         -> returns model name + comparison metrics

Run:
    python app.py
    (listens on http://localhost:5001)
"""

import json
import os
import pickle

import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "model")

app = Flask(__name__)
CORS(app)

_model = None
_scaler = None
_encoders = None
_metadata = None


def load_artifacts():
    global _model, _scaler, _encoders, _metadata
    with open(os.path.join(MODEL_DIR, "best_model.pkl"), "rb") as f:
        _model = pickle.load(f)
    with open(os.path.join(MODEL_DIR, "scaler.pkl"), "rb") as f:
        _scaler = pickle.load(f)
    with open(os.path.join(MODEL_DIR, "encoders.pkl"), "rb") as f:
        _encoders = pickle.load(f)
    with open(os.path.join(MODEL_DIR, "metadata.json"), "r") as f:
        _metadata = json.load(f)


def build_feature_row(payload):
    """Builds a single-row DataFrame matching training feature order."""
    numeric_cols = _metadata["numeric_columns"]
    categorical_cols = _metadata["categorical_columns"]
    feature_cols = _metadata["feature_columns"]

    row = {}
    for col in numeric_cols:
        row[col] = float(payload.get(col, 0))

    for col in categorical_cols:
        raw_val = payload.get(col, None)
        le = _encoders[col]
        if raw_val in le.classes_:
            row[col] = le.transform([raw_val])[0]
        else:
            # unseen category -> fall back to the most common (index 0)
            row[col] = 0

    df = pd.DataFrame([row])[feature_cols]
    return df


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_loaded": _model is not None})


@app.route("/model-info", methods=["GET"])
def model_info():
    return jsonify(_metadata)


@app.route("/predict", methods=["POST"])
def predict():
    try:
        payload = request.get_json(force=True)
        df = build_feature_row(payload)
        X_scaled = _scaler.transform(df)
        prediction = _model.predict(X_scaled)[0]

        # crude confidence proxy based on model type (tree ensembles -> variance across trees)
        confidence = "High"
        try:
            if hasattr(_model, "estimators_"):
                tree_preds = np.array([
                    est.predict(X_scaled)[0] if not isinstance(est, np.ndarray) else est[0].predict(X_scaled)[0]
                    for est in _model.estimators_
                ]) if hasattr(_model.estimators_[0], "predict") else None
                if tree_preds is not None:
                    spread = tree_preds.std() / max(prediction, 1)
                    confidence = "High" if spread < 0.05 else ("Medium" if spread < 0.15 else "Low")
        except Exception:
            confidence = "Medium"

        return jsonify({
            "predicted_price": round(float(prediction), 2),
            "model_used": _metadata["best_model"],
            "confidence": confidence,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    load_artifacts()
    app.run(host="0.0.0.0", port=5001, debug=True)
else:
    load_artifacts()
