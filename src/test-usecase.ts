import { PrismaClient } from '@prisma/client';
import { GetBusinessDetailPrismaRepository } from './modules/business/infra/databases/prisma/repositories/get-business-detail.prisma.repository';
import { GetBusinessDetailUsecase } from './modules/business/application/usecases/get-business-detail.usecase';

const prisma = new PrismaClient();
async function run() {
  const b = await prisma.businessInfo.findFirst({ where: { fantasy_name: { contains: 'Débora e Alexandre' } } });
  if (!b) return;
  const repo = new GetBusinessDetailPrismaRepository();
  const usecase = new GetBusinessDetailUsecase(repo);
  const result = await usecase.execute({ uuid: b.uuid });
  console.log(JSON.stringify(result.PartnerConfig, null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
