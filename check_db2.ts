import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const prog = await prisma.item.findFirst({
    where: { name: 'Programa 1' },
    include: {
      BusinessInfoItem: {
        include: {
          BusinessInfo: {
            include: {
              PartnerConfig: true
            }
          }
        }
      }
    }
  });
  console.log(JSON.stringify(prog, null, 2));
}
main().finally(() => prisma.$disconnect());
