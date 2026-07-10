const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const enrollments = await prisma.enrollment.findMany({
    where: { status: 'pending' },
    include: { student: true, module: true }
  });
  console.log(JSON.stringify(enrollments, null, 2));
}
main().finally(() => prisma.$disconnect());
