import prisma from '../repositories/store.js';

async function testPrismaMethods() {
  try {
    const v = await prisma.vehicles.findMany({ take: 2 });
    console.log('Vehicles findMany OK:', v.length, v[0]?.registration_number);

    const u = await prisma.users.findMany({ take: 2 });
    console.log('Users findMany OK:', u.length, u[0]?.email);

    const t = await prisma.trips.findMany({
      take: 2,
      include: { vehicles: true, drivers: true }
    });
    console.log('Trips findMany with relations OK:', t.length, t[0]?.id);
    console.log('Trip vehicle reg:', t[0]?.vehicles?.registration_number);
    console.log('Trip driver contact:', t[0]?.drivers?.contact);

    const counts = await Promise.all([
      prisma.users.count(),
      prisma.vehicles.count(),
      prisma.drivers.count(),
      prisma.trips.count(),
      prisma.fuel_logs.count(),
      prisma.maintenance.count(),
      prisma.geofences.count(),
      prisma.geofence_alerts.count()
    ]);
    console.log('\nSupabase Table Counts:');
    console.log('users:', counts[0]);
    console.log('vehicles:', counts[1]);
    console.log('drivers:', counts[2]);
    console.log('trips:', counts[3]);
    console.log('fuel_logs:', counts[4]);
    console.log('maintenance:', counts[5]);
    console.log('geofences:', counts[6]);
    console.log('geofence_alerts:', counts[7]);

  } catch (err) {
    console.error('Prisma Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaMethods();
