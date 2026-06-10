const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'info.cynixinc@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (user) {
    await prisma.enrollment.updateMany({
      where: { studentId: user.id, status: 'pending' },
      data: {
        grade: user.grade
      }
    });
    console.log('Fixed grade in pending enrollments!');
  }
}

main().finally(() => prisma.$disconnect());
