const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const contracts = await prisma.businessContract.findMany({
    orderBy: { created_at: 'desc' },
    take: 5
  });
  console.log(contracts);
}
main().catch(console.error).finally(() => prisma.$disconnect());
