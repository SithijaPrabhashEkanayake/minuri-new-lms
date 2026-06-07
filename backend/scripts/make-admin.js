const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User with email ${email} not found in database.`);
    process.exit(1);
  }
  
  const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
  if (!adminRole) {
    console.error(`Admin role not found in database.`);
    process.exit(1);
  }
  
  await prisma.user.update({
    where: { email },
    data: { roleId: adminRole.id }
  });
  
  console.log(`Success! User ${email} is now an Admin!`);
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: node make-admin.js <email>');
  process.exit(1);
}

makeAdmin(email)
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
