# Estimate — AI-Powered Real Estate Price Prediction, Valuation & Recommendation System

A full-stack demo implementing the requirements spec: house price prediction, property
valuation (over/fair/under-priced verdicts), similar-property recommendations, and an
area-wise market analytics dashboard.

## Architecture

```
frontend/    React.js SPA  — UI, forms, dashboard, charts (port 3000)
backend/     Node.js/Express API — validation, business logic, data layer (port 5000)
ml_service/  Python Flask microservice — trained regression model (port 5001)
data/        Dataset generator + CSV data layer (shared by backend & ml_service)
```

Request flow: **Frontend → Backend (Express) → ML Service (Flask) → trained model**
The backend also reads directly from the CSV data layer for recommendations and analytics.

## 1. Generate the dataset (already generated, but to regenerate)

```bash
cd data
python3 generate_dataset.py
# copies: cp house_data.csv ../backend/data/house_data.csv
#         cp house_data.csv ../ml_service/house_data.csv
```

A `house_data.csv` (3000 synthetic listings) is already included in `backend/data/` and
`ml_service/`, so this step is optional unless you want a fresh dataset.

## 2. Train the ML model

```bash
cd ml_service
pip install -r requirements.txt
python3 train_model.py
```

This compares **Linear Regression, Decision Tree, Random Forest, and Gradient Boosting**
(XGBoost-style) regressors on MAE / MSE / RMSE / R², picks the best performer, and saves:

```
ml_service/model/best_model.pkl
ml_service/model/scaler.pkl
ml_service/model/encoders.pkl
ml_service/model/metadata.json   <- also powers the Analytics dashboard's model comparison
```

(Model artifacts are already included in this zip — trained model achieved **R² ≈ 0.97**
with Gradient Boosting — so this step is optional too, unless you want to retrain.)

## 3. Run the ML microservice

```bash
cd ml_service
python3 app.py
# -> http://localhost:5001
```

Endpoints: `POST /predict`, `GET /health`, `GET /model-info`

## 4. Run the backend API

```bash
cd backend
npm install
cp .env.example .env      # adjust PORT / ML_SERVICE_URL if needed
npm start
# -> http://localhost:5000
```

Endpoints (per spec section 10):
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/predict` | Predict house price |
| POST | `/api/valuate` | Compare actual vs predicted price |
| POST | `/api/recommend` | Get property recommendations |
| GET | `/api/analytics` | Fetch dashboard analytics data |
| GET | `/api/admin/metrics` | View latest model metrics |
| GET | `/api/admin/logs` | Export/view request logs |
| POST | `/api/admin/upload` | Upload a new dataset CSV |
| POST | `/api/admin/retrain` | Retrain the model |

## 5. Run the frontend

```bash
cd frontend
npm install
npm start
# -> http://localhost:3000
```

The frontend expects the backend at `http://localhost:5000` by default. To point at a
different backend, create `frontend/.env` with:

```
REACT_APP_API_BASE=http://your-backend-host:5000
```

## Run order (for a fresh clone)

1. `ml_service`: `pip install -r requirements.txt && python3 train_model.py && python3 app.py`
2. `backend`: `npm install && npm start`
3. `frontend`: `npm install && npm start`

## Modules implemented (maps to spec section 7)

1. **Price Prediction** — `/predict` page + `/api/predict` + ML `/predict`
2. **Property Valuation** — `/valuate` page + `/api/valuate`, with an over/fair/under
   gauge visualization
3. **Property Recommendation** — `/recommend` page + `/api/recommend`, weighted
   content-based similarity scoring across price, location, bedrooms, bathrooms,
   furnishing, and parking
4. **Analytics Dashboard** — `/analytics` page + `/api/analytics`: price distribution,
   area vs price, bedrooms vs avg price, furnishing vs price, area-wise comparison,
   correlation heatmap, feature importance, and model comparison
5. **Admin / Data Utility (optional)** — `/api/admin/*`: upload dataset, retrain,
   view metrics, export logs

## Tech stack

- **Frontend:** React 18, React Router, Recharts, Axios
- **Backend:** Node.js, Express, Axios, csv-parse, multer
- **ML Service:** Python, Flask, scikit-learn, pandas, numpy
- **Data layer:** CSV (swappable for MongoDB/PostgreSQL — see `backend/data/dataLayer.js`)

## Notes / Out of scope (per spec section 5)

Live property scraping, authentication, payments, real-time map intelligence,
production deployment configs, and a native mobile app are intentionally out of
scope for this v1, matching the requirements spec.
