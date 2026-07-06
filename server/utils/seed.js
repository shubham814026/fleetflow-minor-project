/**
 * seed.js — FleetFlow: Modular Fleet & Logistics Management System
 *
 * Data covers all 8 system modules from the product spec:
 *  1. Login & Authentication       → Users (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst)
 *  2. Command Center Dashboard     → KPI-ready statuses across Vehicles & Trips
 *  3. Vehicle Registry             → Trucks, Vans, Pickups, Bikes with acquisition cost & odometer
 *  4. Trip Dispatcher & Management → Full lifecycle: Draft → Dispatched → Completed → Cancelled
 *  5. Maintenance & Service Logs   → Auto "In Shop" logic represented in vehicle status
 *  6. Fuel & Expense Logging       → Liters, cost, date per vehicle/trip
 *  7. Driver Performance & Safety  → Safety scores, license expiry, On Duty / Suspended / Off Duty
 *  8. Analytics & Financial Reports→ Revenue, acquisition cost, operational cost data seeded
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import FuelLog from '../models/FuelLog.js';

dotenv.config({ path: '.env' });

// ─── 1. USERS (Page 1 – Login & RBAC) ───────────────────────────────────────
const users = [
  // Fleet Manager: oversees vehicle health, asset lifecycle, scheduling
  { name: 'Maya Fleet',    email: 'manager@fleetflow.io',    password: 'Password123!', role: 'Fleet Manager'      },
  // Dispatcher: creates trips, assigns drivers, validates cargo loads
  { name: 'Dev Dispatcher',email: 'dispatcher@fleetflow.io',password: 'Password123!', role: 'Dispatcher'          },
  // Safety Officer: monitors driver compliance, license expiry, safety scores
  { name: 'Sonia Safety',  email: 'safety@fleetflow.io',     password: 'Password123!', role: 'Safety Officer'      },
  // Financial Analyst: audits fuel spend, maintenance ROI, operational costs
  { name: 'Finn Finance',  email: 'finance@fleetflow.io',    password: 'Password123!', role: 'Financial Analyst'   }
];

const runSeed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany(),
      Vehicle.deleteMany(),
      Driver.deleteMany(),
      Trip.deleteMany(),
      MaintenanceLog.deleteMany(),
      FuelLog.deleteMany()
    ]);

    for (const userData of users) {
      await User.create(userData);
    }

    // ─── 3. VEHICLE REGISTRY (Page 3 – Asset Management) ─────────────────────
    // Types: Truck, Van, Pickup, Bike  |  Statuses: Available, In Shop, On Trip, Retired
    // "In Shop" vehicles are hidden from the Dispatcher's selection pool (maintenance logic)
    const createdVehicles = await Vehicle.insertMany([
      // ── Trucks ──────────────────────────────────────────────────────────────
      {
        model: 'Volvo FH16',
        type: 'Truck',
        licensePlate: 'FL-1024',
        maxLoadCapacity: 32000,   // kg
        acquisitionCost: 185000,  // USD
        odometer: 120430,         // km
        status: 'Available'
      },
      {
        model: 'Scania R500',
        type: 'Truck',
        licensePlate: 'FL-3310',
        maxLoadCapacity: 28000,
        acquisitionCost: 172000,
        odometer: 98760,
        status: 'On Trip'
      },
      // ── Vans ────────────────────────────────────────────────────────────────
      {
        model: 'Mercedes Sprinter 316',
        type: 'Van',
        licensePlate: 'FL-2291',
        maxLoadCapacity: 3500,
        acquisitionCost: 62000,
        odometer: 60440,
        status: 'In Shop'         // Brake line issue — removed from dispatcher pool
      },
      {
        // Workflow from spec: Van-05, 500 kg capacity
        model: 'Ford Transit Van-05',
        type: 'Van',
        licensePlate: 'FL-0500',
        maxLoadCapacity: 500,
        acquisitionCost: 48000,
        odometer: 34210,
        status: 'Available'       // Returned Available after completed 450 kg trip
      },
      {
        model: 'Renault Master',
        type: 'Van',
        licensePlate: 'FL-4401',
        maxLoadCapacity: 2800,
        acquisitionCost: 55000,
        odometer: 41200,
        status: 'Available'
      },
      // ── Pickups ─────────────────────────────────────────────────────────────
      {
        model: 'Ford Ranger XL',
        type: 'Pickup',
        licensePlate: 'FL-8820',
        maxLoadCapacity: 1200,
        acquisitionCost: 41000,
        odometer: 78990,
        status: 'On Trip'
      },
      {
        model: 'Toyota Hilux GR',
        type: 'Pickup',
        licensePlate: 'FL-7712',
        maxLoadCapacity: 1000,
        acquisitionCost: 39500,
        odometer: 52300,
        status: 'Available'
      },
      // ── Bikes / Light Delivery ───────────────────────────────────────────────
      {
        model: 'Honda CB500 Cargo',
        type: 'Other',
        licensePlate: 'FL-B001',
        maxLoadCapacity: 120,
        acquisitionCost: 8500,
        odometer: 18760,
        status: 'Available'
      },
      {
        model: 'Yamaha YFM Cargo',
        type: 'Other',
        licensePlate: 'FL-B002',
        maxLoadCapacity: 100,
        acquisitionCost: 7800,
        odometer: 22100,
        status: 'Out of Service'   // Manual "Out of Service" toggle
      }
    ]);

    // ─── 7. DRIVER PERFORMANCE & SAFETY (Page 7) ─────────────────────────────
    // Safety scores, license expiry (blocks assignment if expired), duty status
    const createdDrivers = await Driver.insertMany([
      // ── On Duty / On Trip ────────────────────────────────────────────────────
      {
        name: 'Ravi Kumar',
        licenseNumber: 'DL-88811',
        licenseExpiryDate: new Date('2027-11-10'),  // Valid
        status: 'On Duty',
        safetyScore: 93
      },
      {
        name: 'Aman Verma',
        licenseNumber: 'DL-90012',
        licenseExpiryDate: new Date('2028-02-22'),  // Valid
        status: 'On Trip',
        safetyScore: 97
      },
      {
        // Spec workflow driver — assigned Van-05 for 450 kg load (< 500 kg limit ✓)
        name: 'Alex Mathew',
        licenseNumber: 'DL-77043',
        licenseExpiryDate: new Date('2029-05-18'),  // Valid — system verified for Van category
        status: 'On Duty',
        safetyScore: 88
      },
      {
        name: 'Priya Nair',
        licenseNumber: 'DL-61230',
        licenseExpiryDate: new Date('2027-08-30'),  // Valid
        status: 'On Duty',
        safetyScore: 91
      },
      {
        name: 'Karan Shah',
        licenseNumber: 'DL-43920',
        licenseExpiryDate: new Date('2026-09-14'),  // Valid (upcoming)
        status: 'Off Duty',
        safetyScore: 85
      },
      // ── Suspended (Safety / Compliance Issue) ────────────────────────────────
      {
        name: 'Neha Singh',
        licenseNumber: 'DL-55120',
        licenseExpiryDate: new Date('2025-06-15'),  // EXPIRED — blocked from assignment
        status: 'Suspended',
        safetyScore: 72
      },
      {
        name: 'Raj Patel',
        licenseNumber: 'DL-30041',
        licenseExpiryDate: new Date('2026-03-01'),  // Expiring soon
        status: 'Off Duty',
        safetyScore: 79
      }
    ]);

    // ─── 4. TRIP DISPATCHER & MANAGEMENT (Page 4) ────────────────────────────
    // Lifecycle: Draft → Dispatched → Completed → Cancelled
    // Validation rule: CargoWeight must NOT exceed Vehicle.maxLoadCapacity
    const createdTrips = await Trip.insertMany([
      // ── DISPATCHED (Active on-road trips) ───────────────────────────────────
      {
        referenceNo: 'TRP-1001',
        origin: 'Delhi Hub',
        destination: 'Jaipur Depot',
        cargoDescription: 'Automotive spare parts',
        cargoWeight: 1800,          // ≤ 32000 (Volvo FH16) ✓
        plannedDistanceKm: 280,
        actualDistanceKm: 286,
        revenue: 2900,
        vehicle: createdVehicles[5]._id,  // Ford Ranger XL (On Trip)
        driver: createdDrivers[1]._id,    // Aman Verma (On Trip)
        status: 'Dispatched',
        dispatchedAt: new Date()
      },
      {
        referenceNo: 'TRP-1002',
        origin: 'Hyderabad Yard',
        destination: 'Bengaluru Terminal',
        cargoDescription: 'Electronics & consumer goods',
        cargoWeight: 24000,         // ≤ 28000 (Scania R500) ✓
        plannedDistanceKm: 574,
        actualDistanceKm: null,
        revenue: 8600,
        vehicle: createdVehicles[1]._id,  // Scania R500 (On Trip)
        driver: createdDrivers[0]._id,    // Ravi Kumar
        status: 'Dispatched',
        dispatchedAt: new Date('2026-02-20')
      },
      // ── COMPLETED ────────────────────────────────────────────────────────────
      {
        referenceNo: 'TRP-1003',
        origin: 'Pune Yard',
        destination: 'Mumbai Terminal',
        cargoDescription: 'Retail pallets — FMCG',
        cargoWeight: 900,           // ≤ 3500 (Mercedes Sprinter) ✓
        plannedDistanceKm: 165,
        actualDistanceKm: 170,
        revenue: 2200,
        vehicle: createdVehicles[0]._id,  // Volvo FH16
        driver: createdDrivers[0]._id,    // Ravi Kumar
        status: 'Completed',
        dispatchedAt: new Date('2026-01-10'),
        completedAt: new Date('2026-01-11')
      },
      {
        // Spec workflow example: Van-05, Alex, 450 kg < 500 kg capacity  ✓
        referenceNo: 'TRP-1004',
        origin: 'Chennai Depot',
        destination: 'Coimbatore Warehouse',
        cargoDescription: 'Textile goods',
        cargoWeight: 450,           // ≤ 500 (Ford Transit Van-05) ✓  Pass
        plannedDistanceKm: 500,
        actualDistanceKm: 508,
        revenue: 3400,
        vehicle: createdVehicles[3]._id,  // Ford Transit Van-05
        driver: createdDrivers[2]._id,    // Alex Mathew
        status: 'Completed',
        dispatchedAt: new Date('2026-02-05'),
        completedAt: new Date('2026-02-06')
      },
      {
        referenceNo: 'TRP-1005',
        origin: 'Kolkata Port',
        destination: 'Bhubaneswar Hub',
        cargoDescription: 'Industrial machinery components',
        cargoWeight: 950,
        plannedDistanceKm: 445,
        actualDistanceKm: 449,
        revenue: 5100,
        vehicle: createdVehicles[6]._id,  // Toyota Hilux GR
        driver: createdDrivers[3]._id,    // Priya Nair
        status: 'Completed',
        dispatchedAt: new Date('2026-01-28'),
        completedAt: new Date('2026-01-29')
      },
      {
        referenceNo: 'TRP-1006',
        origin: 'Ahmedabad Sorting Centre',
        destination: 'Surat Distribution Hub',
        cargoDescription: 'Pharmaceuticals (temperature-controlled)',
        cargoWeight: 2200,
        plannedDistanceKm: 270,
        actualDistanceKm: 275,
        revenue: 4800,
        vehicle: createdVehicles[4]._id,  // Renault Master
        driver: createdDrivers[3]._id,    // Priya Nair
        status: 'Completed',
        dispatchedAt: new Date('2026-02-14'),
        completedAt: new Date('2026-02-14')
      },
      // ── DRAFT (Assigned but not yet dispatched) ─────────────────────────────
      {
        referenceNo: 'TRP-1007',
        origin: 'Nagpur Logistics Park',
        destination: 'Indore Cold Storage',
        cargoDescription: 'Perishable food items',
        cargoWeight: 400,           // ≤ 2800 (Renault Master) ✓
        plannedDistanceKm: 320,
        actualDistanceKm: 0,
        revenue: 2600,
        vehicle: createdVehicles[4]._id,  // Renault Master
        driver: createdDrivers[4]._id,    // Karan Shah (Off Duty — awaiting dispatch)
        status: 'Draft',
        dispatchedAt: null
      },
      // ── CANCELLED ────────────────────────────────────────────────────────────
      {
        referenceNo: 'TRP-1008',
        origin: 'Delhi Hub',
        destination: 'Chandigarh Depot',
        cargoDescription: 'Construction materials',
        cargoWeight: 1100,          // ≤ 32000 (Volvo FH16) ✓
        plannedDistanceKm: 250,
        actualDistanceKm: 0,
        revenue: 0,
        vehicle: createdVehicles[0]._id,  // Volvo FH16
        driver: createdDrivers[4]._id,    // Karan Shah
        status: 'Cancelled',
        cancelledAt: new Date('2026-02-15')
      }
    ]);

    // ─── 5. MAINTENANCE & SERVICE LOGS (Page 5) ──────────────────────────────
    // Adding a vehicle to a service log auto-switches its status to "In Shop"
    // (represented above in Vehicle.status). Resolved: false = still in shop.
    await MaintenanceLog.insertMany([
      {
        vehicle: createdVehicles[2]._id,  // Mercedes Sprinter → In Shop
        serviceType: 'Brake line inspection',
        notes: 'Fluid leak detected in rear-right brake line. Full replacement required.',
        cost: 640,
        serviceDate: new Date('2026-02-10'),
        resolved: false             // Vehicle still unavailable to dispatcher
      },
      {
        // Spec workflow step 5: Manager logs Oil Change → auto In Shop
        vehicle: createdVehicles[0]._id,  // Volvo FH16 — post-trip maintenance
        serviceType: 'Engine oil change & filter replacement',
        notes: 'Routine 10,000 km service. Oil changed; air filter replaced.',
        cost: 310,
        serviceDate: new Date('2026-01-12'),
        resolved: true              // Vehicle returned to Available pool
      },
      {
        vehicle: createdVehicles[1]._id,  // Scania R500
        serviceType: 'Tyre rotation & wheel alignment',
        notes: 'Front tyres showing uneven wear. Rotated and aligned.',
        cost: 480,
        serviceDate: new Date('2026-02-01'),
        resolved: true
      },
      {
        vehicle: createdVehicles[3]._id,  // Ford Transit Van-05 — post-trip service
        serviceType: 'Post-trip inspection — Van-05',
        notes: 'Standard post-delivery inspection. Brakes, lights, fluid levels all OK.',
        cost: 180,
        serviceDate: new Date('2026-02-07'),
        resolved: true
      },
      {
        vehicle: createdVehicles[5]._id,  // Ford Ranger XL
        serviceType: 'Suspension overhaul',
        notes: 'Front shock absorbers replaced after high off-road mileage.',
        cost: 820,
        serviceDate: new Date('2026-01-20'),
        resolved: true
      }
    ]);

    // ─── 6. FUEL & EXPENSE LOGGING (Page 6) ──────────────────────────────────
    // Tracks Liters, Cost, Date per Vehicle/Trip
    // Supports analytics: Fuel Efficiency (km/L), Cost-per-km, Vehicle ROI
    await FuelLog.insertMany([
      // Volvo FH16 — Pune→Mumbai completed trip
      {
        vehicle: createdVehicles[0]._id,
        trip: createdTrips[2]._id,
        liters: 62,
        cost: 104,
        date: new Date('2026-01-11')
      },
      // Ford Ranger XL — active Delhi→Jaipur trip
      {
        vehicle: createdVehicles[5]._id,
        trip: createdTrips[0]._id,
        liters: 41,
        cost: 75,
        date: new Date('2026-02-21')
      },
      // Scania R500 — Hyderabad→Bengaluru (in progress)
      {
        vehicle: createdVehicles[1]._id,
        trip: createdTrips[1]._id,
        liters: 198,
        cost: 348,
        date: new Date('2026-02-20')
      },
      // Ford Transit Van-05 — Chennai→Coimbatore (spec workflow trip: Alex + Van-05)
      {
        vehicle: createdVehicles[3]._id,
        trip: createdTrips[3]._id,
        liters: 55,
        cost: 96,
        date: new Date('2026-02-06')
      },
      // Toyota Hilux GR — Kolkata→Bhubaneswar
      {
        vehicle: createdVehicles[6]._id,
        trip: createdTrips[4]._id,
        liters: 68,
        cost: 116,
        date: new Date('2026-01-29')
      },
      // Renault Master — Ahmedabad→Surat
      {
        vehicle: createdVehicles[4]._id,
        trip: createdTrips[5]._id,
        liters: 49,
        cost: 88,
        date: new Date('2026-02-14')
      },
      // Volvo FH16 — standalone refuel (depot fill-up, no linked trip)
      {
        vehicle: createdVehicles[0]._id,
        trip: null,
        liters: 120,
        cost: 204,
        date: new Date('2026-02-18')
      }
    ]);

    console.log('✅ FleetFlow seed data inserted successfully');
    console.log('   Users       :', users.length);
    console.log('   Vehicles    :', 9);
    console.log('   Drivers     :', 7);
    console.log('   Trips       :', 8, '(2 Dispatched, 4 Completed, 1 Draft, 1 Cancelled)');
    console.log('   Maintenance :', 5);
    console.log('   Fuel Logs   :', 7);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

runSeed().finally(async () => {
  await mongoose.connection.close();
});
