import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const allBranches = await prisma.businessinfoBranch.findMany();
  console.log('Total BusinessinfoBranch:', allBranches.length);
  console.log(JSON.stringify(allBranches, null, 2));
}
main().finally(() => prisma.$disconnect());
