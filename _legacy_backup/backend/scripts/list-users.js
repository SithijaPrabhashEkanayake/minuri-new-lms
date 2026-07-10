const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const users = await p.user.findMany({ include: { role: true } });
  console.log('=== USERS IN DATABASE ===');
  users.forEach(u => {
    console.log(JSON.stringify({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role ? u.role.name : 'NO ROLE',
      status: u.status
    }));
  });
  console.log('Total users:', users.length);

  const roles = await p.role.findMany();
  console.log('\n=== ROLES IN DATABASE ===');
  roles.forEach(r => console.log(JSON.stringify({ id: r.id, name: r.name })));
}

main()
  .catch(e => console.error('Error:', e.message))
  .finally(() => p.$disconnect());
