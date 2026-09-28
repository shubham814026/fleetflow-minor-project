import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function runVerification() {
  console.log('===========================================================');
  console.log('  FLEETFLOW RELATIONAL DATABASE VERIFICATION (SUPABASE)   ');
  console.log('===========================================================\n');

  try {
    // 1. Check live connection
    console.log('1. Testing Connection to Supabase PostgreSQL...');
    const ping = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log('   ✓ Connected to Supabase DB:', ping[0].current_database, '| User:', ping[0].current_user);

    // 2. Insert Test User
    console.log('\n2. Testing INSERT into users table...');
    const testEmail = `admin.test.${Date.now()}@smartfleet.ai`;
    const user = await prisma.users.create({
      data: {
        name: 'Supabase Fleet Admin',
        email: testEmail,
        password_hash: await bcrypt.hash('admin123', 10),
        role: 'SUPER_ADMIN',
        status: 'active'
      }
    });
    console.log('   ✓ Inserted User:', { id: user.id, email: user.email, role: user.role });

    // 3. Retrieve User
    console.log('\n3. Testing RETRIEVE from users table...');
    const fetchedUser = await prisma.users.findUnique({
      where: { id: user.id }
    });
    console.log('   ✓ Retrieved User by ID:', { id: fetchedUser.id, name: fetchedUser.name, email: fetchedUser.email });

    // 4. Insert Vehicle
    console.log('\n4. Testing INSERT into vehicles table...');
    const regNum = `KA-01-SF-${Math.floor(1000 + Math.random() * 9000)}`;
    const owner = await prisma.owners.findFirst();
    const vehicle = await prisma.vehicles.create({
      data: {
        registration_number: regNum,
        brand: 'Tata',
        model: 'Signa 4825.TK',
        vehicle_type: 'Heavy Tipper Truck',
        status: 'available',
        owner_id: owner?.id || '00000000-0000-0000-0000-000000000000'
      }
    });
    console.log('   ✓ Inserted Vehicle:', { id: vehicle.id, reg: vehicle.registration_number, brand: vehicle.brand });

    // 5. Insert Driver
    console.log('\n5. Testing INSERT into drivers table...');
    const driverEmail = `driver.${Date.now()}@smartfleet.ai`;
    const driverUser = await prisma.users.create({
      data: {
        name: 'Vikram Singh',
        email: driverEmail,
        password_hash: await bcrypt.hash('driver123', 10),
        role: 'DRIVER',
        status: 'active'
      }
    });
    const driver = await prisma.drivers.create({
      data: {
        user_id: driverUser.id,
        owner_id: owner?.id || '00000000-0000-0000-0000-000000000000',
        contact: '+91 98765 43210',
        license_number: `DL${Math.floor(10000000 + Math.random() * 90000000)}`,
        status: 'active'
      }
    });
    console.log('   ✓ Inserted Driver:', { id: driver.id, name: driverUser.name, license: driver.license_number });

    // 6. Insert Relational Trip
    console.log('\n6. Testing INSERT into trips table (Relational Foreign Keys)...');
    const trip = await prisma.trips.create({
      data: {
        vehicle_id: vehicle.id,
        driver_id: driver.id,
        start_lat: 12.9716,
        start_lng: 77.5946,
        end_lat: 13.0827,
        end_lng: 80.2707,
        status: 'IN_PROGRESS',
        distance: 348.0,
        avg_speed: 58.0
      },
      include: {
        vehicles: true,
        drivers: { include: { users: true } }
      }
    });
    console.log('   ✓ Inserted Trip:', { id: trip.id, status: trip.status, vehicle: trip.vehicles?.registration_number, driver: trip.drivers?.users?.name });

    // 7. Table Counts
    console.log('\n7. Current Table Counts in Supabase:');
    const [userCount, vehicleCount, driverCount, tripCount, fuelCount, alertCount] = await Promise.all([
      prisma.users.count(),
      prisma.vehicles.count(),
      prisma.drivers.count(),
      prisma.trips.count(),
      prisma.fuel_logs.count(),
      prisma.geofence_alerts.count()
    ]);
    console.log(`   • Users in DB:    ${userCount}`);
    console.log(`   • Vehicles in DB: ${vehicleCount}`);
    console.log(`   • Drivers in DB:  ${driverCount}`);
    console.log(`   • Trips in DB:    ${tripCount}`);
    console.log(`   • Fuel Logs:      ${fuelCount}`);
    console.log(`   • Alerts in DB:   ${alertCount}`);

    console.log('\n===========================================================');
    console.log('  ALL INSERTIONS AND RETRIEVALS PASSED SUCCESSFULLY!       ');
    console.log('===========================================================');

  } catch (error) {
    console.error('\n❌ Verification Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
