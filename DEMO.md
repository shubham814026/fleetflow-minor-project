# FleetFlow Hackathon Demo (3–4 min)

## 0) One-liner
FleetFlow is a modular fleet ops control center: dispatch, compliance, maintenance, fuel/expense, and ROI analytics—all in one clean UI.

## 1) Story Hook (15s)
Paper logbooks fail in real time. FleetFlow shows live status (Available/On Trip/In Shop), blocks bad dispatches, and gives ROI on every vehicle.

## 2) What I’ll Show (bullets)
- Role-based login (Manager/Dispatcher/Safety/Finance)
- Command Center KPIs + filters
- Safe dispatch with capacity/license checks
- Maintenance workflow auto-updates availability
- Fuel/expense capture and operational cost
- Analytics: Fuel efficiency + ROI with CSV export

## 3) Live Flow (3 min)
1) Login as **Fleet Manager** (manager@fleetflow.io / Password123!).
2) Dashboard: highlight KPI cards (Active Fleet, Maintenance Alerts, Utilization, Pending Cargo). Apply a quick vehicle-type filter.
3) Vehicle Registry: toggle a vehicle to **Out of Service** to show real-time status change.
4) Trip Dispatcher:
   - Attempt overweight cargo → see validation block.
   - Create a valid trip with available vehicle/driver → status goes **Dispatched**, vehicle/driver set to **On Trip**.
5) Maintenance: add a service log → vehicle auto-moves to **In Shop**, disappears from available dispatch list.
6) Expense & Fuel: log liters + cost, show operational cost summary for a selected vehicle.
7) Drivers: point out license expiry and completion rate.
8) Analytics: show bar chart (Fuel Efficiency + ROI) and click **Export CSV**.

## 4) Why It’s Strong (30s)
- Safety-first dispatch: blocks expired licenses, suspended drivers, overloaded vehicles, or in-shop assets.
- Operational accuracy: odometer updates on completion; maintenance locks vehicles; costs roll into ROI.
- Demo-ready UX: clean Tailwind UI, status pills, toasts, responsive tables.

## 5) Tech Snapshot (15s)
- Frontend: React (Vite), Tailwind, React Router, Context, Axios, Chart.js.
- Backend: Node/Express, MongoDB/Mongoose, JWT, role guards.
- Seed data + scripts: `npm run seed` (server), `npm run dev` (server/client).

## 6) Call to Action (10s)
“Let’s extend this to predictive maintenance (sensor feeds) and revenue forecasting next.”
