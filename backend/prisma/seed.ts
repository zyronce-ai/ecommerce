import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@shophub.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@shophub.com', password: adminPassword, role: 'ADMIN' },
  });

  const userPassword = await bcrypt.hash('user123', 12);
  await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: { name: 'Test User', email: 'user@test.com', password: userPassword, role: 'USER' },
  });

  console.log('[PRISMA SEED] Admin & test user created');
}

main().catch(console.error).finally(() => prisma.$disconnect());
