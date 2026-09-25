# FleetFlow / SmartFleet AI – Real-Time Fleet & Logistics Intelligence Platform

SmartFleet AI (FleetFlow) is an enterprise full-stack fleet management and predictive logistics platform. It pairs real-time GPS telemetry, driver management, maintenance scheduling, and fuel tracking with **5 production-grade Machine Learning inference models** served via a dedicated Python FastAPI microservice.

---

## Architecture Overview

```
┌──────────────────────────────────────┐
│       React Frontend Client &        │
│          Driver Mobile PWA           │
│       (Vite + Tailwind CSS)          │
│       http://localhost:5173          │
└──────────────────┬───────────────────┘
                   │
                   │ REST API & WebSockets (Socket.IO)
                   ▼
┌──────────────────────────────────────┐
│     Node.js Express Backend Gateway  │
│   (Prisma ORM + Supabase PostgreSQL) │
│       http://localhost:5000          │
└──────────────────┬───────────────────┘
                   │
                   │ High-Speed Internal HTTP (<15ms)
                   ▼
┌──────────────────────────────────────┐
│  Python FastAPI ML Inference Service │
│   (Loads 5 Trained Models in RAM)    │
│       http://127.0.0.1:8000          │
└──────────────────────────────────────┘
```

---

## The 5 Integrated Real-Time Machine Learning Models

All 5 models are loaded into memory on microservice startup for sub-15ms live inference:

| Model # | Domain | Algorithm / Pipeline | Real-Time Endpoint | Frontend Integration |
|---|---|---|---|---|
| **7.1** | **Fuel Efficiency & Over-Consumption** | RandomForestRegressor ($R^2=0.9069$) + ColumnTransformer | `POST /predict/fuel-efficiency` | [`FuelPage.jsx`](client/src/pages/FuelPage.jsx): Live trip consumption residuals, excess liters, and monetary cost leakage (₹). |
| **7.2** | **Resource Utilisation & Profiling** | K-Means ($k=2$, Silhouette: $0.8697$) + MinMaxScaler | `POST /predict/utilisation` | [`UtilisationPage.jsx`](client/src/pages/UtilisationPage.jsx): 0–100 dynamic utilisation score and recommendation tags (`Optimal`, `Monitor`, `Consider Removal`). |
| **7.3** | **Driver Fraud & Theft Detection** | IsolationForest (contamination: $0.05$) | `POST /predict/fraud` | [`AlertsPage.jsx`](client/src/pages/AlertsPage.jsx) & Live Map: Siphoning and route anomaly flags with 0–100 risk score and automatic high-severity alerts. |
| **7.4** | **Demand & Staffing Forecasting** | Holt-Winters Exponential Smoothing & Prophet ($7.5\%$ MAPE) | `GET /predict/demand` | [`ForecastPage.jsx`](client/src/pages/ForecastPage.jsx) & [`DashboardPage.jsx`](client/src/pages/DashboardPage.jsx): Next 7–30 day trip demand projections, peak days, and driver/vehicle capacity deficits. |
| **7.5** | **Predictive Vehicle Maintenance** | Decision Tree Classifier & Random Forest (F1: $1.0$) | `POST /predict/maintenance` | [`MaintenancePage.jsx`](client/src/pages/MaintenancePage.jsx) & [`VehicleDetailPage.jsx`](client/src/pages/VehicleDetailPage.jsx): Breakdown risk score (%), overdue status, and component failure factors. |

---

## Project Structure

```text
fleetflow-minor-project/
├── client/                     # React 18 (Vite) Frontend & Driver PWA
│   ├── src/
│   │   ├── api/                # API client with offline demo fallback
│   │   ├── components/         # UI components & Modals
│   │   ├── layouts/            # AppLayout & DriverLayout
│   │   ├── pages/              # Admin and Driver pages (LiveMap, Fuel, Utilisation, etc.)
│   │   └── services/           # Socket.IO & IndexedDB GPS tracking service
├── server/                     # Node.js Express Backend API Gateway
│   ├── src/
│   │   ├── config/             # Environment & Swagger configurations
│   │   ├── controllers/        # Domain controllers (fuel, alert, vehicle, etc.)
│   │   ├── routes/             # REST endpoints
│   │   └── services/           # mlServiceClient (FastAPI bridge) & socketService
│   ├── prisma/                 # Prisma database schema
│   └── utils/                  # Database seed and verification utilities
├── ml_service/                 # Python FastAPI Real-Time Inference Microservice
│   ├── main.py                 # FastAPI application pre-loading 5 models in RAM
│   ├── start_service.py        # Microservice launcher (Port 8000)
│   ├── test_inference.py       # Automated test suite for all 5 ML endpoints
│   └── requirements.txt        # Python ML runtime dependencies
├── models/                     # Serialized production .joblib models (git-ignored)
├── models code/                # Model training scripts and progression studies
├── reports/                    # Model evaluation reports, CSVs, and PNG charts
└── ml_datasets/                # Training datasets (git-ignored)
```

---

## Quickstart Guide

### 1. Start the Python ML Inference Microservice
```powershell
python ml_service/start_service.py
```
*Service will start on `http://127.0.0.1:8000` and pre-load all 5 models into RAM.*  
*To verify all 5 endpoints:* `python ml_service/test_inference.py`

### 2. Start the Node.js Express Backend
```powershell
cd server
npm install
npm run dev
```
*Backend runs on `http://localhost:5000` with Swagger documentation at `http://localhost:5000/api/docs`.*

### 3. Start the React Frontend
```powershell
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@fleetflow.com` | `admin123` |
| **Fleet Manager** | `manager@smartfleet.ai` | `password123` |
| **Driver (PWA)** | `driver@fleetflow.com` | `driver123` |
| **Secondary Auth ID** | `SEC-1234` | `admin123` |

---

## API Summary

- **Authentication**: `POST /api/auth/login`, `POST /api/auth/secondary-verify`
- **Vehicles**: `GET/POST /api/vehicles`, `GET /api/vehicles/:id`, `GET /api/vehicles/utilisation`
- **Drivers**: `GET/POST /api/drivers`, `GET /api/drivers/:id`, `GET /api/drivers/safety-metrics`
- **Trips**: `GET /api/trips`, `POST /api/trips/start`, `POST /api/trips/:id/end`
- **GPS Telemetry**: `POST /api/gps/points`, `POST /api/gps/sync-offline`
- **Fuel Intelligence**: `GET /api/fuel`, `GET /api/fuel/metrics`, `POST /api/fuel/logs`
- **Demand Forecasting**: `GET /api/forecast/demand`
- **Predictive Maintenance**: `GET /api/maintenance`, `POST /api/maintenance`, `GET /api/ml-insights/maintenance/:vehicleId`
- **Alerts & SOS**: `GET /api/alerts`, `POST /api/alerts/sos`, `PATCH /api/alerts/:id`
- **ML Microservice Internal**: `POST /predict/fuel-efficiency`, `POST /predict/maintenance`, `POST /predict/fraud`, `POST /predict/utilisation`, `GET /predict/demand`
