const { PrismaClient } = require('@prisma/client');
const { CloudflareR2Storage } = require('./src/infra/providers/storage/implementations/cloudflare-r2/cloudflare-r2.storage');
const { ListBusinessOrdersUseCase } = require('./src/modules/Company/BusinessItemsDetails/usecases/BusinessPrePaidItemsManagement/list-business-orders/list-business-orders.usecase');
const { BusinessOrderPrismaRepository } = require('./src/modules/Company/BusinessItemsDetails/repositories/implementations/business-order-prisma.repository');

async function test() {
  const repo = new BusinessOrderPrismaRepository();
  const storage = new CloudflareR2Storage();
  const usecase = new ListBusinessOrdersUseCase(repo, storage);
  
  const result = await usecase.execute('c2c1b922-f12c-49cd-b697-009887d02d15', '57912175-a765-40a6-9682-06bf7fea4372');
  console.log(JSON.stringify(result, null, 2));
}

test().catch(console.error);
