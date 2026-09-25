const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const business = await prisma.businessInfo.findFirst({
    where: { fantasy_name: { contains: 'Rebeca' } },
    include: {
      BusinessContract: true
    }
  });
  console.log(JSON.stringify(business, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
