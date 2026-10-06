const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const orders = await prisma.businessOrder.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    include: { _count: { select: { OrderItems: true } } }
  });
  console.log(JSON.stringify(orders, null, 2));
  await prisma.$disconnect();
}
check();
