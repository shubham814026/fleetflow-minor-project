# FleetFlow – Modular Fleet & Logistics Management System

FleetFlow is a modular full-stack platform that digitizes fleet operations: vehicle lifecycle, driver compliance, trip dispatching, maintenance, fuel/expense tracking, and ROI analytics.

## 1) Backend (Generated First)

Location: `server/`

### Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Role-based authorization

### Modules
- `models/`: `User`, `Vehicle`, `Driver`, `Trip`, `MaintenanceLog`, `FuelLog`
- `controllers/`: domain logic and validations
- `routes/`: REST endpoints per module
- `middleware/`: auth + error handling
- `utils/`: token generation, async helpers, seeding

### Key Business Rules Implemented
- Vehicle dispatch blocked when status is `In Shop`, `Out of Service`, or `On Trip`
- Driver dispatch blocked when suspended, expired license, or already on trip
- Trip creation blocked if `cargoWeight > vehicle.maxLoadCapacity`
- Trip lifecycle supports: `Draft -> Dispatched -> Completed -> Cancelled`
- On trip completion:
  - vehicle odometer auto increments
  - vehicle status returns to `Available` (or `Out of Service` if flagged)
  - driver status moves to `On Duty`
- On maintenance log creation:
  - vehicle auto moves to `In Shop`
  - vehicle is naturally excluded from available-dispatch lists
- Vehicle deletion blocked if active trip exists
- Driver completion rate auto-calculated using aggregate stats
- Operational cost endpoint: `Fuel + Maintenance`
- Analytics formulas:
  - `Fuel Efficiency = km / L`
  - `ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost`

### Seed Data
Run seed script to generate realistic demo users, vehicles, drivers, trips, maintenance, and fuel logs.

Seed credentials:
- manager@fleetflow.io / Password123!
- dispatcher@fleetflow.io / Password123!
- safety@fleetflow.io / Password123!
- finance@fleetflow.io / Password123!

---

## 2) Frontend

Location: `client/`

### Stack
- React (Vite)
- JavaScript (no TypeScript)
- Tailwind CSS
- React Router
- Context API
- Axios
- Chart.js (`react-chartjs-2`)

### UI Highlights
- Clean SaaS-style layout (blue/indigo/gray)
- KPI cards, status pills, responsive tables
- Smooth hover states, no heavy animation
- Toast notifications + loading spinners

### Required Pages Implemented
1. Login (JWT + role-based redirect)
2. Dashboard Command Center (KPIs + filters)
3. Vehicle Registry (CRUD + OOS toggle)
4. Trip Dispatcher (capacity and availability validation)
5. Maintenance & Service Logs (auto `In Shop` status behavior)
6. Expense & Fuel Logging (operational cost computation)
7. Driver Management (license compliance + completion rate view)
8. Analytics (charts + CSV export)

---

## 3) Integration Steps

1. Start MongoDB locally (`mongodb://127.0.0.1:27017/fleetflow`) or update env values.
2. Configure backend env using `server/.env.example`.
3. Configure frontend env using `client/.env.example`.
4. Seed backend data (`npm run seed` in `server`).
5. Login from frontend using seeded credentials.

---

## 4) Setup Instructions

### Backend
```bash
cd server
npm install
copy .env.example .env
npm run seed
npm run dev
```

### Frontend
```bash
cd client
npm install
copy .env.example .env
npm run dev
```

Frontend URL: `http://localhost:5173`
Backend URL: `http://localhost:5000`

---

## 5) Demo Script (Hackathon Friendly)

1. Login as **Fleet Manager** and open Dashboard.
2. Show KPI cards and filter by `Truck` + `On Trip`.
3. Go to Vehicle Registry and toggle one vehicle to `Out of Service`.
4. Go to Trip Dispatcher:
   - Attempt over-capacity cargo (show validation error)
   - Create valid trip and dispatch
5. Open Maintenance page and add service log:
   - Explain auto status to `In Shop`
   - Show vehicle unavailable for dispatch
6. Open Expense & Fuel page and add a fuel record.
7. Open Driver page and highlight completion rate + license visibility.
8. Open Analytics page:
   - Show Fuel Efficiency + ROI chart
   - Export CSV
9. Log out and log in as **Financial Analyst** to show role-scoped analytics access.

---


## API Overview

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/vehicles`
- `PATCH /api/vehicles/:id/out-of-service`
- `GET/POST/PUT/DELETE /api/drivers`
- `GET/POST /api/trips`
- `PATCH /api/trips/:id/status`
- `GET/POST /api/maintenance`
- `PATCH /api/maintenance/:id/resolve`
- `GET/POST /api/fuel`
- `GET /api/fuel/cost/:vehicleId`
- `GET /api/dashboard`
- `GET /api/analytics`


