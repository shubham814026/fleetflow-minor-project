# SmartFleet AI - Machine Learning to Web Integration Architecture

**Author / Integration Lead:** Purvesh Rohit & Team  
**Project:** SmartFleet AI (Fleet & GPS Telemetry Platform)  
**Scope:** Bridging Trained Machine Learning Models with Full-Stack Web Application (Node.js/Express + React/Vite)

---

## 1. Executive Summary

In this project:
- **Teammate 1 (ML Engineer)** trained 5 specialized Machine Learning models on fleet telemetry datasets and exported them as serialized joblib artifacts (`.joblib`).
- **Teammate 2 (Full-Stack Developer)** created the web application UI and REST API skeleton using static/mock telemetry data.
- **System Integration Task**: Architect, develop, and verify the end-to-end integration layer that feeds real-time outputs and predictions from all 5 ML models directly into the web application's backend controllers and interactive React frontend pages.

---

## 2. Integration Architecture

### Why a Microservice Architecture?
Spawning a fresh Python process for each web request (e.g. via `child_process.spawn`) suffers from:
1. High startup latency (1.5s - 3.5s per request to import `scikit-learn`, `pandas`, `joblib`).
2. Event loop blocking in Node.js.
3. High memory thrashing under concurrent load.

**Solution Implemented:**
A dedicated **Python FastAPI Microservice** (running on port `8000`) pre-loads all 5 ML models into memory at application startup. The **Node.js Express Backend** (port `5000`) communicates with the ML microservice over internal HTTP with sub-15ms latency, enriched with a **circuit-breaker / graceful fallback** mechanism in `mlServiceClient.js`. The **React Frontend** (port `5173`) renders the live inference results.

```
┌─────────────────────────────────────────────────────────────┐
│                 ML Layer (FastAPI :8000)                    │
│   Pre-loads 5 ML Models (.joblib) into memory at startup    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Internal HTTP (<15ms)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│           Node.js Express Backend & Bridge (:5000)          │
│   • mlServiceClient.js (resilient fetch + fallback)        │
│   • Controllers: fuel, vehicle, alert, forecast, maintenance│
│   • JWT Auth & Supabase Database Queries                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 React Frontend (:5173)                      │
│   • client/src/api/index.js                                 │
│   • FuelPage, UtilisationPage, AlertsPage, ForecastPage,   │
│     MaintenancePage, VehicleDetailPage                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Model-by-Model Pipeline

### Model 7.1: Real-Time Fuel Efficiency & Over-Consumption Audit
- **Algorithm:** Random Forest Regressor
- **Artifact:** `fuel_efficiency_model.joblib`
- **Trained By:** `models code/train_model_7_1.py`
- **Features:** Vehicle type, age, mileage, distance, duration, avg speed, payload weight, idle time, weather, rainfall.
- **FastAPI Route:** `POST http://127.0.0.1:8000/predict/fuel-efficiency`
- **Express Bridge:** `mlServiceClient.getFuelInsights()` in `server/src/services/mlServiceClient.js`
- **Controller:** `server/src/controllers/fuelController.js` (`getFuelMetrics`)
- **Frontend Page:** `client/src/pages/FuelPage.jsx` (`/fuel`)
- **Visual Presentation:** Displays the **AI Model 7.1 LIVE** pulse badge, predicted fuel rate (L/km), over-consumption residual audit, and monthly cost savings in ₹ INR.

---

### Model 7.2: Driver & Fleet Utilisation Scoring
- **Algorithm:** K-Means Clustering + MinMax Normalization
- **Artifact:** `driver_utilisation_kmeans.joblib`
- **Trained By:** `models code/train_model_7_2.py`
- **Features:** Trips per day, total active hours, idle ratio, driver experience.
- **FastAPI Route:** `POST http://127.0.0.1:8000/predict/utilisation`
- **Express Bridge:** `mlServiceClient.getDriverUtilisation()` in `server/src/services/mlServiceClient.js`
- **Controller:** `server/src/controllers/vehicleController.js` (`getUtilisationMetrics`)
- **Frontend Page:** `client/src/pages/UtilisationPage.jsx` (`/utilisation`)
- **Visual Presentation:** Dynamic utilization score (0-100), K-Means cluster classification (*High Performer*, *Balanced Asset*, *Under-utilized*), and actionable dispatch reassignment recommendations.

---

### Model 7.3: Fuel Theft & Driver Fraud Detection
- **Algorithm:** Isolation Forest Anomaly Detector
- **Artifact:** `fraud_detection_isolation_forest.joblib`
- **Trained By:** `models code/train_model_7_3.py`
- **Features:** Fuel consumption deviation, route deviation ratio, refill frequency, stationary fuel drop volume.
- **FastAPI Route:** `POST http://127.0.0.1:8000/predict/fraud`
- **Express Bridge:** `mlServiceClient.getFraudInsights()` in `server/src/services/mlServiceClient.js`
- **Controller:** `server/src/controllers/alertController.js` (`getAlerts`)
- **Frontend Page:** `client/src/pages/AlertsPage.jsx` (`/alerts`)
- **Visual Presentation:** Automatically injects high-priority alerts with **AI Isolation Forest** badges, severity tags, and exact mathematical anomaly explanations (e.g. *Fuel consumption 2.2x higher than fleet average, 32L sudden tank drop*).

---

### Model 7.4: Fleet Demand & Capacity Deficit Forecasting
- **Algorithm:** Holt-Winters Exponential Smoothing / Prophet
- **Artifact:** `demand_forecasting_enhanced_models.joblib`
- **Trained By:** `models code/train_model_7_4.py` / `train_model_7_4_enhanced.py`
- **Features:** Historical trip frequency, weekly seasonality, regional dispatch demand.
- **FastAPI Route:** `GET http://127.0.0.1:8000/predict/demand?days=7`
- **Express Bridge:** `mlServiceClient.getDemandForecast()` in `server/src/services/mlServiceClient.js`
- **Controller:** `server/src/controllers/forecastController.js` (`getForecast`)
- **Frontend Page:** `client/src/pages/ForecastPage.jsx` (`/forecast`)
- **Visual Presentation:** Displays 7-day total trip demand, projected vehicle deficit count, peak dispatch day, and regional ICD/JNPT volume trends with the **AI Model 7.4 LIVE** badge.

---

### Model 7.5: Predictive Maintenance & Component Breakdown Risk
- **Algorithm:** Decision Tree Classifier
- **Artifact:** `maintenance_prediction_model.joblib`
- **Trained By:** `models code/train_model_7_5.py`
- **Features:** Odometer reading, distance since last service, harsh braking events, average load weight, vehicle age.
- **FastAPI Route:** `POST http://127.0.0.1:8000/predict/maintenance`
- **Express Bridge:** `mlServiceClient.getMaintenancePrediction()` in `server/src/services/mlServiceClient.js`
- **Controller:** `server/src/controllers/maintenanceController.js` (`getMaintenanceRecords`) and `mlInsightController.js`
- **Frontend Pages:**
  1. `client/src/pages/MaintenancePage.jsx` (`/maintenance`): Fleet table with dynamic **Breakdown Risk (AI Model 7.5)** progress bars, Primary Component at Risk, and AI LIVE badges.
  2. `client/src/pages/VehicleDetailPage.jsx` (`/vehicles/:id`): Dedicated **AI Predictive Maintenance Diagnostics** card rendering breakdown risk %, failing components (e.g. *Brake Fluid & Pad Wear*), and specific physical wear risk factors.

---

## 4. Key Bug Fixes & Improvements Implemented

1. **Fixed Silent Fallback in `vehicleController.js`**:
   The controller had a `try { const mlScore = await mlServiceClient.getDriverUtilisation(...) } catch { return item; }` block, but `mlServiceClient` was never imported at the top of the file, causing it to silently catch a `ReferenceError` and fall back to static data. Added `import { mlServiceClient } from '../services/mlServiceClient.js'`.
2. **Model 7.2 Feature Calibration**:
   The dataset was trained on annualized trips-per-day (`completed_trips / 365.0`, range ~0.25–0.37) and annual operating hours (~1,200–2,400 hrs). Calibrated the Express mapping to scale daily working-day figures into the model's exact MinMax training distribution, producing differentiated scores (16–69) and accurate K-Means cluster assignments (Cluster 0 vs Cluster 1) instead of clipping at 100%.
3. **Model 7.5 Tree Inference Fix**:
   Decision Trees and Random Forests split directly on physical domain units (odometer in km, harsh brake counts, load in kg). The inference service was mistakenly passing standard-scaled z-scores into the trees. Fixed by feeding unscaled engineered domain features, resulting in exact 79% (Overdue) vs 7.5% (Healthy) breakdown risk predictions.
4. **PostgreSQL URI Character Encoding**:
   The Supabase password contained an `@` character (`Fleetflow@123`), which broke URL parsing in `psycopg2` and Prisma. URL-encoded as `%40` (`Fleetflow%40123`).
5. **Model Deserialization Compatibility**:
   Re-trained models in the Python 3.13 runtime environment using unified joblib protocols to eliminate version mismatch errors.
6. **Resilient Circuit Breaker**:
   Added a 2,500ms timeout with `AbortController` in `mlServiceClient.js` so that if the ML service is restarting or under heavy compute, the website remains 100% available without hanging.

---

## 5. How to Run & Demonstrate End-to-End

### Step 1: Start Python FastAPI ML Microservice
```powershell
python ml_service/start_service.py
# Verify: Open http://127.0.0.1:8000/docs to view the Swagger UI
```

### Step 2: Start Node.js Express Backend
```powershell
cd server
node index.js
# Runs on http://localhost:5000
```

### Step 3: Start React Client
```powershell
cd client
npm run dev
# Open http://localhost:5173
```

### Step 4: Login Credentials
- **Email:** `admin@fleetflow.com`
- **Password:** `admin123`
- **Secondary Auth PIN:** `SEC-1234`

---

## 6. Live Demonstration Checklist

| Feature to Show | URL | What to Point Out |
| :--- | :--- | :--- |
| **Fuel Intelligence** | `/fuel` | AI Model 7.1 LIVE badge, predicted L/km rate, potential savings |
| **Fleet Utilisation** | `/utilisation` | K-Means cluster assignments, dynamic 0-100 scores |
| **Fraud & Theft Detection** | `/alerts` | Isolation Forest anomaly alerts, fuel drop explanations |
| **Demand Forecasting** | `/forecast` | Prophet 7-day projected trips, vehicle deficit calculation |
| **Fleet Maintenance** | `/maintenance` | Model 7.5 Breakdown Risk %, primary component at risk |
| **Vehicle Deep Diagnostics** | `/vehicles/veh-101` | Live AI Predictive Maintenance Diagnostics card |
