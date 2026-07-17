"""
train_model.py
Trains and compares multiple regression algorithms on the house price
dataset, then saves the best-performing model + preprocessing objects
to disk (model/best_model.pkl, model/scaler.pkl, model/encoders.pkl).

Algorithms compared (per spec section 9 - ML Requirements):
    - Linear Regression
    - Decision Tree Regressor
    - Random Forest Regressor
    - XGBoost / Gradient Boosting Regressor

Metrics: MAE, MSE, RMSE, R2 Score

Run:
    python train_model.py
"""

import json
import os
import pickle

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.tree import DecisionTreeRegressor

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "house_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "model")
os.makedirs(MODEL_DIR, exist_ok=True)

CATEGORICAL_COLS = ["location", "furnishing"]
NUMERIC_COLS = ["area", "bedrooms", "bathrooms", "stories", "parking", "age_years", "amenities_score"]
FEATURE_COLS = NUMERIC_COLS + CATEGORICAL_COLS
TARGET_COL = "price"


def load_data():
    df = pd.read_csv(DATA_PATH)
    return df


def preprocess(df):
    encoders = {}
    df_enc = df.copy()
    for col in CATEGORICAL_COLS:
        le = LabelEncoder()
        df_enc[col] = le.fit_transform(df_enc[col])
        encoders[col] = le

    X = df_enc[FEATURE_COLS]
    y = df_enc[TARGET_COL]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, y, scaler, encoders


def evaluate(model, X_test, y_test):
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    mse = mean_squared_error(y_test, preds)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, preds)
    return {"MAE": mae, "MSE": mse, "RMSE": rmse, "R2": r2}


def main():
    print("Loading dataset...")
    df = load_data()
    X, y, scaler, encoders = preprocess(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    candidates = {
        "LinearRegression": LinearRegression(),
        "DecisionTreeRegressor": DecisionTreeRegressor(max_depth=12, random_state=42),
        "RandomForestRegressor": RandomForestRegressor(
            n_estimators=200, max_depth=16, random_state=42, n_jobs=-1
        ),
        "GradientBoosting(XGBoost-alt)": GradientBoostingRegressor(
            n_estimators=200, max_depth=4, learning_rate=0.08, random_state=42
        ),
    }

    results = {}
    trained_models = {}

    for name, model in candidates.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)
        metrics = evaluate(model, X_test, y_test)
        results[name] = metrics
        trained_models[name] = model
        print(f"  {name}: R2={metrics['R2']:.4f}  RMSE={metrics['RMSE']:.2f}  MAE={metrics['MAE']:.2f}")

    # Pick best model by R2 score
    best_name = max(results, key=lambda k: results[k]["R2"])
    best_model = trained_models[best_name]
    print(f"\nBest model: {best_name} (R2={results[best_name]['R2']:.4f})")

    # Save best model + preprocessing objects
    with open(os.path.join(MODEL_DIR, "best_model.pkl"), "wb") as f:
        pickle.dump(best_model, f)
    with open(os.path.join(MODEL_DIR, "scaler.pkl"), "wb") as f:
        pickle.dump(scaler, f)
    with open(os.path.join(MODEL_DIR, "encoders.pkl"), "wb") as f:
        pickle.dump(encoders, f)

    # Save metadata: model name + comparison metrics (used by /api/analytics -> model comparison)
    metadata = {
        "best_model": best_name,
        "feature_columns": FEATURE_COLS,
        "categorical_columns": CATEGORICAL_COLS,
        "numeric_columns": NUMERIC_COLS,
        "comparison": results,
    }
    with open(os.path.join(MODEL_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nSaved model artifacts to {MODEL_DIR}/")
    print("  - best_model.pkl")
    print("  - scaler.pkl")
    print("  - encoders.pkl")
    print("  - metadata.json")


if __name__ == "__main__":
    main()
