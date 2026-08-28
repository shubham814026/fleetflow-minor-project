import { PrismaClient } from '@prisma/client';

let prisma;
try {
  prisma = new PrismaClient();
} catch (e) {
  console.warn('PrismaClient init warning, fallback active');
}

export { prisma };
export default prisma;
