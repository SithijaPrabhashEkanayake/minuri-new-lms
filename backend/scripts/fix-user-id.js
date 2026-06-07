const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.user.update({
  where: { email: 'info.cynixinc@gmail.com' },
  data: { id: 'a6738d95-7339-42b2-a529-5d744d5b9093' }
})
.then(() => console.log('Fixed!'))
.catch(e => console.error(e))
.finally(() => p.$disconnect());
