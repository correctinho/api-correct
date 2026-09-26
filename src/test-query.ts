import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const business = await prisma.businessInfo.findFirst({
    where: { fantasy_name: { contains: 'Débora e Alexandre' } },
    include: { PartnerConfig: true }
  });
  console.log(JSON.stringify(business, null, 2));
}
main().finally(() => prisma.());
