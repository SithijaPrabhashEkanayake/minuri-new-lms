const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.user.findMany({
  include: { role: true }
}).then(users => {
  console.log(JSON.stringify(users, null, 2));
})
.catch(e => console.error(e))
.finally(() => p.$disconnect());
