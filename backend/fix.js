const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'info.cynixinc@gmail.com';
  
  // Update user profile
  const user = await prisma.user.update({
    where: { email },
    data: {
      classType: 'Theory',
      medium: 'Physical',
      institution: 'Ziplin'
    }
  });

  // Update their pending enrollments
  await prisma.enrollment.updateMany({
    where: { studentId: user.id, status: 'pending' },
    data: {
      classType: 'Theory',
      medium: 'Physical',
      institution: 'Ziplin'
    }
  });

  console.log('Fixed legacy user data!');
}

main().finally(() => prisma.$disconnect());
