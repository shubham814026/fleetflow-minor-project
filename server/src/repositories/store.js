import { PrismaClient } from '@prisma/client';

let prisma;
try {
  prisma = new PrismaClient();
} catch (e) {
  console.warn('PrismaClient init warning:', e.message);
}

export const checkDatabaseConnection = async () => {
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl || dbUrl.includes('[YOUR-') || dbUrl.includes('your-supabase-ref')) {
    return {
      connected: false,
      configured: false,
      message: 'Supabase PostgreSQL connection pending configuration in server/.env (enter your Supabase DATABASE_URL and DIRECT_URL)'
    };
  }

  if (!prisma) {
    return { connected: false, configured: true, message: 'Prisma client not initialized' };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true, configured: true, message: 'Supabase PostgreSQL connected successfully via Prisma' };
  } catch (error) {
    return { connected: false, configured: true, message: error.message };
  }
};

export { prisma };
export default prisma;
