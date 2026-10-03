import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const configs = await prisma.partnerConfig.findMany({
    select: { items_uuid: true, title: true, main_branch: true }
  });
  console.log(JSON.stringify(configs, null, 2));
}
main().finally(() => prisma.$disconnect());
