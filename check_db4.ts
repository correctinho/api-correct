import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.businessInfo.count();
  const p = await prisma.partnerConfig.count();
  console.log('BusinessInfos:', c, 'PartnerConfigs:', p);
}
main().finally(() => prisma.$disconnect());
