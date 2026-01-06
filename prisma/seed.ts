import * as bcrypt from 'bcrypt';
import { PrismaClient } from 'src/generated/prisma/client';
import { Role } from 'src/generated/prisma/enums';

const prisma = new PrismaClient({} as undefined);

async function main() {
  const adminEmail = 'aizen@gmail.com';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('aizen2002', 10);

  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      fullname: 'JMark Dayna',
      username: 'aizen2002',
      age: 23,
      role: Role.Admin,
    },
  });

  console.log('Admin user seeded successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('ERROR', e);
    await prisma.$disconnect();
    process.exit(1);
  });
