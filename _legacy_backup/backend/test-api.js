
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing modules...');
  const modules = await prisma.module.findMany();
  console.log('Modules count:', modules.length);
  
  if (modules.length > 0) {
    console.log(modules.map(m => ({ id: m.id, title: m.title, published: m.published })));
  }

  console.log('Testing liveSession model...');
  try {
    const sessions = await prisma.liveSession.findMany();
    console.log('Live sessions:', sessions.length);
  } catch (err) {
    console.error('Error finding liveSession:', err.message);
  }
}

main().finally(() => prisma.$disconnect());
