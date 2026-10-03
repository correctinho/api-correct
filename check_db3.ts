import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const allBii = await prisma.businessInfoItem.findMany();
  console.log('Total BusinessInfoItems:', allBii.length);
  const allItems = await prisma.item.findMany({ where: { item_type: 'programa' } });
  console.log('All Programs:');
  for (const item of allItems) {
    const count = await prisma.businessInfoItem.count({ where: { item_uuid: item.uuid } });
    console.log(item.name, '-> Partners:', count);
  }
}
main().finally(() => prisma.$disconnect());
