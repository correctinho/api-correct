import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const transaction = await prisma.transactions.findUnique({
    where: {
      uuid: { uuid: 'f94429b9-2ec0-4002-9b3b-fd48cc33f56a' }
    }
  });
  console.log(transaction?.net_price);
}

main().finally(() => prisma.$disconnect());
