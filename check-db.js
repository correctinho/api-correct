const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const business = await prisma.businessInfo.findFirst({
    where: { fantasy_name: { contains: 'Débora e Alexandre' } },
    include: { PartnerConfig: true }
  });
  console.log('Business found:', business?.uuid);
  console.log('PartnerConfig:', JSON.stringify(business?.PartnerConfig, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
