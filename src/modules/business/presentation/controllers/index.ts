import { ListPartnerPrismaRepository } from '../../infra/databases/prisma/repositories/list-partner.prisma.repository';
import { ListPartnerController } from './list-partner.controller';
import { GetBusinessDetailPrismaRepository } from '../../infra/databases/prisma/repositories/get-business-detail.prisma.repository';
import { GetBusinessDetailController } from './get-business-detail.controller';
import { ApproveBusinessPrismaRepository } from '../../infra/databases/prisma/repositories/approve-business.prisma.repository';
import { ApproveBusinessController } from './approve-business.controller';
import { ResendAccessPrismaRepository } from '../../infra/databases/prisma/repositories/resend-access.prisma.repository';
import { ResendAccessController } from './resend-access.controller';
import { TitanMailProvider } from '../../../../infra/providers/MailProvider/implementations/TitanMailProvider';

const titanMailProvider = new TitanMailProvider();

const listPartnerRepository = new ListPartnerPrismaRepository();
const listPartnerController = new ListPartnerController(listPartnerRepository);

const getBusinessDetailRepository = new GetBusinessDetailPrismaRepository();
const getBusinessDetailController = new GetBusinessDetailController(getBusinessDetailRepository);

const approveBusinessRepository = new ApproveBusinessPrismaRepository();
const approveBusinessController = new ApproveBusinessController(approveBusinessRepository, titanMailProvider);

const resendAccessRepository = new ResendAccessPrismaRepository();
const resendAccessController = new ResendAccessController(resendAccessRepository, titanMailProvider);

export { 
  listPartnerController,
  getBusinessDetailController,
  approveBusinessController,
  resendAccessController,
};
