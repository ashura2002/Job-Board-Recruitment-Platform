import * as bcrypt from 'bcrypt';
const { PrismaClient, Role } = require('../src/generated/prisma/client');
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create a PG connection using DATABASE_URL
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });

// Attach Prisma to the PG adapter
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Main seed logic (create only if data does not exist)
async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;

  // Prevent duplicate seed data
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      fullname: process.env.ADMIN_FULLNAME,
      username: process.env.ADMIN_USERNAME,
      age: 23,
      role: Role.Admin,
    },
  });

  console.log('Admin user seeded successfully');
}

// Run seed and always disconnect Prisma
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
