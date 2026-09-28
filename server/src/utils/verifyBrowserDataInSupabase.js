import prisma from '../repositories/store.js';

async function verifySupabaseBrowserData() {
  console.log('====================================================');
  console.log('  VERIFYING BROWSER ACTIONS DIRECTLY IN SUPABASE    ');
  console.log('====================================================\n');

  try {
    // 1. Verify Vehicles Created in Browser
    console.log('1. Querying Supabase for browser-created vehicles...');
    const testPlates = ['MH-04-E2E-9999', 'KA-05-E2E-7777'];
    for (const plate of testPlates) {
      const veh = await prisma.vehicles.findUnique({
        where: { registration_number: plate }
      });

      if (veh) {
        console.log(`   ✓ CONFIRMED IN SUPABASE POSTGRESQL (${plate}):`);
        console.log('     ID:          ', veh.id);
        console.log('     Registration:', veh.registration_number);
        console.log('     Brand:       ', veh.brand);
        console.log('     Model:       ', veh.model);
        console.log('     Type:        ', veh.vehicle_type);
        console.log('     Status:      ', veh.status);
        console.log('     Created At:  ', veh.created_at);
      } else {
        console.log(`   - Vehicle ${plate} not found in Supabase.`);
      }
    }

    // 2. Querying Trip Created in Browser
    console.log('\n2. Querying Supabase for trip dispatched for vehicle "KA-05-E2E-7777"...');
    const trips = await prisma.trips.findMany({
      where: {
        vehicles: { registration_number: 'KA-05-E2E-7777' }
      },
      include: {
        vehicles: true,
        drivers: { include: { users: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    if (trips.length > 0) {
      console.log(`   ✓ CONFIRMED IN SUPABASE POSTGRESQL (${trips.length} trip(s) found):`);
      for (const t of trips) {
        console.log('     Trip ID:     ', t.id);
        console.log('     Vehicle:     ', t.vehicles?.registration_number);
        console.log('     Driver:      ', t.drivers?.users?.name);
        console.log('     Start Coords:', `${t.start_lat}, ${t.start_lng}`);
        console.log('     Status:      ', t.status);
        console.log('     Created At:  ', t.created_at);
      }
    } else {
      console.log('   (Looking for any recent trips created today)...');
      const recentTrips = await prisma.trips.findMany({
        take: 3,
        orderBy: { created_at: 'desc' },
        include: { vehicles: true }
      });
      for (const t of recentTrips) {
        console.log('     Recent Trip:', t.id, t.vehicles?.registration_number, t.status, t.created_at);
      }
    }

    // 3. Querying Fuel Logs in Supabase
    console.log('\n3. Querying Supabase for fuel logs...');
    const recentFuel = await prisma.fuel_logs.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: { vehicles: true }
    });

    console.log(`   ✓ Latest Fuel Logs in Supabase:`);
    for (const f of recentFuel) {
      console.log(`     ID: ${f.id} | Vehicle: ${f.vehicles?.registration_number} | Liters: ${f.liters} | Cost: ₹${f.cost} | Date: ${f.created_at}`);
    }

    console.log('\n====================================================');
    console.log('  SUPABASE VERIFICATION COMPLETE                    ');
    console.log('====================================================');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

verifySupabaseBrowserData();
