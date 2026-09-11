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
    console.log('\n2. Testing INSERT into User table...');
    const testEmail = `admin.test.${Date.now()}@smartfleet.ai`;
    const user = await prisma.user.create({
      data: {
        name: 'Supabase Fleet Admin',
        email: testEmail,
        passwordHash: await bcrypt.hash('admin123', 10),
        role: 'SUPER_ADMIN'
      }
    });
    console.log('   ✓ Inserted User:', { id: user.id, email: user.email, role: user.role });

    // 3. Retrieve User
    console.log('\n3. Testing RETRIEVE from User table...');
    const fetchedUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    console.log('   ✓ Retrieved User by ID:', { id: fetchedUser.id, name: fetchedUser.name, email: fetchedUser.email });

    // 4. Insert Vehicle
    console.log('\n4. Testing INSERT into Vehicle table...');
    const regNum = `KA-01-SF-${Math.floor(1000 + Math.random() * 9000)}`;
    const vehicle = await prisma.vehicle.create({
      data: {
        registrationNumber: regNum,
        makeModel: 'Tata Signa 4825.TK',
        type: 'Heavy Tipper Truck',
        status: 'moving',
        speed: 62.5,
        heading: 180.0,
        lat: 12.9716,
        lng: 77.5946,
        fuelLevel: 85.0,
        odometer: 14520.0
      }
    });
    console.log('   ✓ Inserted Vehicle:', { id: vehicle.id, reg: vehicle.registrationNumber, model: vehicle.makeModel });

    // 5. Insert Driver
    console.log('\n5. Testing INSERT into Driver table...');
    const driverEmail = `driver.${Date.now()}@smartfleet.ai`;
    const driver = await prisma.driver.create({
      data: {
        name: 'Vikram Singh',
        email: driverEmail,
        phone: '+91 98765 43210',
        status: 'Active',
        licenseNumber: `DL-${Math.floor(100000 + Math.random() * 900000)}`,
        safetyScore: 94.5,
        totalTrips: 18,
        rating: 4.9
      }
    });
    console.log('   ✓ Inserted Driver:', { id: driver.id, name: driver.name, license: driver.licenseNumber });

    // 6. Insert Relational Trip (links Vehicle and Driver)
    console.log('\n6. Testing INSERT into Trip table (Relational Foreign Keys)...');
    const tripCode = `TRIP-${Date.now()}`;
    const trip = await prisma.trip.create({
      data: {
        tripCode,
        vehicleId: vehicle.id,
        driverId: driver.id,
        origin: 'Bangalore Logistics Hub A',
        destination: 'Chennai Port Terminal 2',
        startLat: 12.9716,
        startLng: 77.5946,
        endLat: 13.0827,
        endLng: 80.2707,
        status: 'In Transit',
        distanceKm: 348.0,
        avgSpeed: 58.0
      }
    });
    console.log('   ✓ Inserted Trip:', { id: trip.id, code: trip.tripCode, origin: trip.origin, destination: trip.destination });

    // 7. Test Relational Query (Trip with Vehicle and Driver details)
    console.log('\n7. Testing RELATIONAL QUERY (JOIN Trip -> Vehicle + Driver)...');
    const tripWithRelations = await prisma.trip.findUnique({
      where: { id: trip.id },
      include: {
        vehicle: true,
        driver: true
      }
    });
    console.log('   ✓ Relational Query Result:');
    console.log('     Trip Code:', tripWithRelations.tripCode);
    console.log('     Vehicle Reg:', tripWithRelations.vehicle.registrationNumber, `(${tripWithRelations.vehicle.makeModel})`);
    console.log('     Driver Name:', tripWithRelations.driver.name, `(Score: ${tripWithRelations.driver.safetyScore})`);
    console.log('     Status:', tripWithRelations.status);

    // 8. Insert and Retrieve Alert
    console.log('\n8. Testing INSERT & RETRIEVE Alert table...');
    const alert = await prisma.alert.create({
      data: {
        category: 'Speeding',
        severity: 'High',
        vehicleReg: vehicle.registrationNumber,
        driverName: driver.name,
        description: 'Vehicle exceeded 80 km/h threshold in zone NH44'
      }
    });
    const retrievedAlert = await prisma.alert.findUnique({ where: { id: alert.id } });
    console.log('   ✓ Inserted & Retrieved Alert:', {
      id: retrievedAlert.id,
      category: retrievedAlert.category,
      severity: retrievedAlert.severity,
      description: retrievedAlert.description
    });

    // 9. Table Row Counts
    console.log('\n9. Current Table Counts in Supabase:');
    const [userCount, vehicleCount, driverCount, tripCount, alertCount] = await Promise.all([
      prisma.user.count(),
      prisma.vehicle.count(),
      prisma.driver.count(),
      prisma.trip.count(),
      prisma.alert.count()
    ]);
    console.log(`   • Users in DB:    ${userCount}`);
    console.log(`   • Vehicles in DB: ${vehicleCount}`);
    console.log(`   • Drivers in DB:  ${driverCount}`);
    console.log(`   • Trips in DB:    ${tripCount}`);
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
