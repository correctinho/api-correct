const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.userItem.findMany({
    where: { item_name: 'Alimentação' },
    select: {
      item_name: true,
      status: true,
      group_uuid: true,
      UserInfo: {
        select: {
          full_name: true
        }
      }
    }
  });
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
