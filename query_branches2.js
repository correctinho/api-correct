const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const branches = await prisma.branchInfo.findMany({
    include: { BranchItem: { include: { Item: true } } }
  });
  console.log(JSON.stringify(branches, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
