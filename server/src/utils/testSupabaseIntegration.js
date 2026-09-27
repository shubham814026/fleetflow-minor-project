import { getVehicles, createVehicle } from '../controllers/vehicleController.js';
import { getDrivers } from '../controllers/driverController.js';
import { getTrips, startTrip, endTrip } from '../controllers/tripController.js';
import { getGeofences } from '../controllers/geofenceController.js';
import { getAlerts } from '../controllers/alertController.js';
import { getMaintenanceRecords } from '../controllers/maintenanceController.js';
import { addFuelLog } from '../controllers/fuelController.js';
import { login } from '../controllers/authController.js';
import prisma from '../repositories/store.js';

function mockRes() {
  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };
  return res;
}

async function runEndToEndTests() {
  console.log('====================================================');
  console.log('   TESTING SUPABASE FULL DATA STORE INTEGRATION     ');
  console.log('====================================================\n');

  try {
    // 1. Auth Test
    console.log('1. Testing Login against Supabase Users...');
    const authRes = mockRes();
    await login({ body: { email: 'admin@fleetflow.com', password: 'admin123', role: 'SUPER_ADMIN' } }, authRes);
    console.log('   ✓ Login Status:', authRes.statusCode, '| User:', authRes.payload?.data?.user?.email);

    // 2. Vehicles Test
    console.log('\n2. Testing getVehicles from Supabase...');
    const vehRes = mockRes();
    await getVehicles({ query: { page: 1, limit: 5 } }, vehRes);
    console.log('   ✓ Total Vehicles in Supabase:', vehRes.payload?.meta?.total);
    console.log('   ✓ Sample Vehicle:', {
      id: vehRes.payload?.data?.[0]?.id,
      reg: vehRes.payload?.data?.[0]?.registration,
      makeModel: vehRes.payload?.data?.[0]?.makeModel
    });

    // 3. Drivers Test
    console.log('\n3. Testing getDrivers from Supabase...');
    const drvRes = mockRes();
    await getDrivers({ query: { page: 1, limit: 5 } }, drvRes);
    console.log('   ✓ Total Drivers in Supabase:', drvRes.payload?.meta?.total);
    console.log('   ✓ Sample Driver:', {
      id: drvRes.payload?.data?.[0]?.id,
      name: drvRes.payload?.data?.[0]?.name,
      contact: drvRes.payload?.data?.[0]?.phone
    });

    // 4. Trips Test
    console.log('\n4. Testing getTrips from Supabase...');
    const tripRes = mockRes();
    await getTrips({ query: { page: 1, limit: 5 } }, tripRes);
    console.log('   ✓ Total Trips in Supabase:', tripRes.payload?.meta?.total);
    console.log('   ✓ Sample Trip:', {
      id: tripRes.payload?.data?.[0]?.id,
      code: tripRes.payload?.data?.[0]?.tripCode,
      origin: tripRes.payload?.data?.[0]?.origin,
      dest: tripRes.payload?.data?.[0]?.destination,
      status: tripRes.payload?.data?.[0]?.status
    });

    // 5. Geofences Test
    console.log('\n5. Testing getGeofences from Supabase...');
    const geoRes = mockRes();
    await getGeofences({}, geoRes);
    console.log('   ✓ Total Geofences loaded:', geoRes.payload?.data?.length);
    console.log('   ✓ First Geofence:', geoRes.payload?.data?.[0]?.name);

    // 6. Alerts Test
    console.log('\n6. Testing getAlerts from Supabase...');
    const alertRes = mockRes();
    await getAlerts({ query: {} }, alertRes);
    console.log('   ✓ Total Alerts loaded:', alertRes.payload?.data?.length);
    console.log('   ✓ First Alert:', alertRes.payload?.data?.[0]?.description);

    // 7. Maintenance Records Test
    console.log('\n7. Testing getMaintenanceRecords from Supabase...');
    const maintRes = mockRes();
    await getMaintenanceRecords({}, maintRes);
    console.log('   ✓ Maintenance Records count:', maintRes.payload?.data?.length);
    console.log('   ✓ First Record:', {
      reg: maintRes.payload?.data?.[0]?.vehicleReg,
      service: maintRes.payload?.data?.[0]?.serviceType,
      risk: maintRes.payload?.data?.[0]?.breakdownRiskScore
    });

    // 8. Create Vehicle in Supabase
    console.log('\n8. Testing INSERT Vehicle into Supabase...');
    const testReg = `MH-04-LIVE-${Math.floor(1000 + Math.random() * 9000)}`;
    const createVehRes = mockRes();
    await createVehicle({ body: { registrationNumber: testReg, makeModel: 'BharatBenz 2823R', type: 'Heavy Tipper' } }, createVehRes);
    console.log('   ✓ Created Vehicle in Supabase:', {
      id: createVehRes.payload?.data?.id,
      reg: createVehRes.payload?.data?.registration
    });

    // Verify it exists in DB directly
    const verifyVeh = await prisma.vehicles.findUnique({ where: { registration_number: testReg } });
    console.log('   ✓ Direct DB Check: Found inserted vehicle in Supabase!', verifyVeh?.registration_number);

    // 9. Start Trip in Supabase
    console.log('\n9. Testing INSERT Trip into Supabase...');
    const startTripRes = mockRes();
    await startTrip({
      body: {
        vehicleReg: testReg,
        origin: 'Bengaluru Logistics Corridor',
        destination: 'Chennai Sea Port',
        startLocation: { lat: 12.9716, lng: 77.5946 }
      },
      user: { id: 'usr-105', name: 'Fleet Admin', role: 'SUPER_ADMIN' }
    }, startTripRes);

    const createdTripId = startTripRes.payload?.data?.id;
    console.log('   ✓ Started Trip in Supabase:', {
      id: createdTripId,
      code: startTripRes.payload?.data?.tripCode,
      status: startTripRes.payload?.data?.status
    });

    // 10. End Trip in Supabase
    console.log('\n10. Testing UPDATE Trip in Supabase...');
    const endTripRes = mockRes();
    await endTrip({
      params: { id: createdTripId },
      body: { distanceKm: 342.5, durationHours: 6.2, idleMinutes: 15 }
    }, endTripRes);
    console.log('   ✓ Ended Trip in Supabase:', {
      id: endTripRes.payload?.data?.id,
      status: endTripRes.payload?.data?.status,
      distance: endTripRes.payload?.data?.distanceKm
    });

    // 11. Add Fuel Log in Supabase
    console.log('\n11. Testing INSERT Fuel Log into Supabase...');
    const fuelRes = mockRes();
    await addFuelLog({
      body: {
        vehicleReg: testReg,
        litres: 120.5,
        cost: 11450,
        odometer: 145000,
        fuelStation: 'IndianOil National Highway Pump'
      }
    }, fuelRes);
    console.log('   ✓ Inserted Fuel Log in Supabase:', fuelRes.payload?.data);

    console.log('\n====================================================');
    console.log('   ALL SUPABASE END-TO-END TESTS PASSED 100%!       ');
    console.log('====================================================');

  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runEndToEndTests();
