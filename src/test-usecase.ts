import { PrismaClient } from '@prisma/client';
import { GetBusinessDetailUsecase } from './src/modules/business/application/usecases/get-business-detail.usecase';
import { GetBusinessDetailPrismaRepository } from './src/modules/business/infra/databases/prisma/repositories/get-business-detail.prisma.repository';

const prisma = new PrismaClient();
async function run() {
  const b = await prisma.businessInfo.findFirst({ where: { fantasy_name: { contains: 'Débora e Alexandre' } } });
  console.log('UUID:', b?.uuid);
  if (!b) return;
  const repo = new GetBusinessDetailPrismaRepository();
  const usecase = new GetBusinessDetailUsecase(repo);
  const result = await usecase.execute({ uuid: b.uuid });
  console.log(JSON.stringify(result.PartnerConfig, null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
