const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const branches = await prisma.branch.findMany({take: 1});
  console.log(branches);
}
main().catch(console.error).finally(() => prisma.$disconnect());
