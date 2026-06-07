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
