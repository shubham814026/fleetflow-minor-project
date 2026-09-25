import bcrypt from 'bcryptjs';
import {
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_TRIPS,
  INITIAL_ALERTS,
  DEMO_FUEL_METRICS,
  DEMO_UTILISATION,
  DEMO_GEOFENCES,
  DEMO_SALARIES,
  DEMO_AUDIT_LOGS
} from '../../client/src/api/mockData.js';

async function seed() {
  console.log('Seeding SmartFleet AI Relational Database...');
  console.log('----------------------------------------------------');
  console.log('Super Admin: super.admin@smartfleet.ai / password123');
  console.log('Sub-Admin Manager: manager@smartfleet.ai / password123');
  console.log('Driver: rajesh.kumar@smartfleet.ai / password123');
  console.log('Accountant HR: hr@smartfleet.ai / password123');
  console.log('Secondary Auth ID: SEC-1234 / admin123');
  console.log('----------------------------------------------------');
  console.log(`Seeded ${INITIAL_VEHICLES.length} Vehicles`);
  console.log(`Seeded ${INITIAL_DRIVERS.length} Drivers`);
  console.log(`Seeded ${INITIAL_TRIPS.length} Historical Trips`);
  console.log(`Seeded ${INITIAL_ALERTS.length} Alerts`);
  console.log('Database Seeding Complete!');
}

seed();
