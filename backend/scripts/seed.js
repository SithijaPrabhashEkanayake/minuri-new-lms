const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Roles and Modules into Postgres...');

  // --- Roles ---
  // Use upsert so the seed is idempotent (safe to run multiple times)
  const studentRole = await prisma.role.upsert({
    where: { name: 'Student' },
    update: {},
    create: { name: 'Student', permissions: ['view_library', 'take_quiz'] }
  });
  const teacherRole = await prisma.role.upsert({
    where: { name: 'Teacher' },
    update: {},
    create: { name: 'Teacher', permissions: ['stream_class', 'create_quiz', 'view_reports'] }
  });
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', permissions: ['manage_users', 'approve_payments', 'manage_content'] }
  });

  console.log(`Roles seeded: ${studentRole.name}, ${teacherRole.name}, ${adminRole.name}`);

  // --- NOTE ---
  // Users are NOT seeded here. They must be created through the
  // Supabase Auth registration flow so that their UUID matches
  // the Supabase auth.users table. Use the frontend Gateway
  // registration form to create new users.

  // Create dummy instructor for modules
  let instructor = await prisma.user.findFirst({ where: { roleId: teacherRole.id } });
  if (!instructor) {
    instructor = await prisma.user.create({
      data: {
        id: 'system-instructor-uuid-0001',
        name: 'System Instructor',
        email: 'instructor@system.local',
        password: 'NO_LOGIN',
        phoneHash: 'none',
        roleId: teacherRole.id,
        consentGiven: true
      }
    });
  }

  console.log('Wiping existing enrollments and modules...');
  await prisma.videoView.deleteMany({});
  await prisma.video.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.module.deleteMany({});

  console.log('Creating the 4 required catalogs...');
  const catalogs = [
    { title: 'GRADE 11 THEORY', grade: 11, price: 2500, published: true, instructorId: instructor.id },
    { title: 'GRADE 11 PAPER CLASS', grade: 11, price: 2000, published: true, instructorId: instructor.id },
    { title: 'GRADE 10 THEORY', grade: 10, price: 2500, published: true, instructorId: instructor.id },
    { title: 'GRADE 10 PAPER CLASS', grade: 10, price: 2000, published: true, instructorId: instructor.id }
  ];

  for (const c of catalogs) {
    await prisma.module.create({ data: c });
  }

  console.log('Seeding complete. Register users via the frontend registration form.');
}

main()
  .catch(e => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
