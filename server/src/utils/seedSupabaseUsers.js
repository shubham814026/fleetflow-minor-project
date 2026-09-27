import prisma from '../repositories/store.js';
import bcrypt from 'bcryptjs';

async function seedUsers() {
  try {
    const demoAccounts = [
      { email: 'admin@fleetflow.com', name: 'Fleet Admin', role: 'SUPER_ADMIN', pwd: 'admin123' },
      { email: 'super.admin@smartfleet.ai', name: 'Super Admin', role: 'SUPER_ADMIN', pwd: 'password123' },
      { email: 'rajesh.kumar@smartfleet.ai', name: 'Rajesh Kumar', role: 'DRIVER', pwd: 'password123' },
      { email: 'driver@fleetflow.com', name: 'Fleet Driver', role: 'DRIVER', pwd: 'driver123' }
    ];

    for (const acc of demoAccounts) {
      const existing = await prisma.users.findUnique({ where: { email: acc.email } });
      if (!existing) {
        const hash = bcrypt.hashSync(acc.pwd, 10);
        const newUser = await prisma.users.create({
          data: {
            name: acc.name,
            email: acc.email,
            password_hash: hash,
            role: acc.role,
            status: 'active'
          }
        });
        console.log('Created user in Supabase:', newUser.email, newUser.id);

        if (acc.role === 'DRIVER') {
          // Check if driver profile exists
          const existingDriver = await prisma.drivers.findFirst({ where: { user_id: newUser.id } });
          if (!existingDriver) {
            // Get an owner id
            const owner = await prisma.owners.findFirst();
            if (owner) {
              await prisma.drivers.create({
                data: {
                  user_id: newUser.id,
                  owner_id: owner.id,
                  contact: '+919876543210',
                  license_number: `DL${Math.floor(10000000 + Math.random() * 90000000)}`,
                  status: 'active'
                }
              });
              console.log('Created driver profile for:', acc.email);
            }
          }
        }
      } else {
        console.log('User already exists in Supabase:', acc.email);
      }
    }
  } catch (err) {
    console.error('Error seeding users:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
