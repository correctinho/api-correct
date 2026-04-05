import { ListPartnerPrismaRepository } from '../../infra/databases/prisma/repositories/list-partner.prisma.repository';
import { ListPartnerController } from './list-partner.controller';
import { GetBusinessDetailPrismaRepository } from '../../infra/databases/prisma/repositories/get-business-detail.prisma.repository';
import { GetBusinessDetailController } from './get-business-detail.controller';
import { ApproveBusinessPrismaRepository } from '../../infra/databases/prisma/repositories/approve-business.prisma.repository';
import { ApproveBusinessController } from './approve-business.controller';
import { ResendAccessPrismaRepository } from '../../infra/databases/prisma/repositories/resend-access.prisma.repository';
import { ResendAccessController } from './resend-access.controller';
import { ListEmployerPrismaRepository } from '../../infra/databases/prisma/repositories/list-employer.prisma.repository';
import { ListEmployerController } from './list-employer.controller';
import { GetEmployerDetailsPrismaRepository } from '../../infra/databases/prisma/repositories/get-employer-details.prisma.repository';
import { GetEmployerDetailsController } from './get-employer-details.controller';
import { TitanMailProvider } from '../../../../infra/providers/MailProvider/implementations/TitanMailProvider';

const titanMailProvider = new TitanMailProvider();

const listPartnerRepository = new ListPartnerPrismaRepository();
const listPartnerController = new ListPartnerController(listPartnerRepository);

const listEmployerRepository = new ListEmployerPrismaRepository();
const listEmployerController = new ListEmployerController(listEmployerRepository);

const getEmployerDetailsRepository = new GetEmployerDetailsPrismaRepository();
const getEmployerDetailsController = new GetEmployerDetailsController(getEmployerDetailsRepository);

const getBusinessDetailRepository = new GetBusinessDetailPrismaRepository();
const getBusinessDetailController = new GetBusinessDetailController(getBusinessDetailRepository);

const approveBusinessRepository = new ApproveBusinessPrismaRepository();
const approveBusinessController = new ApproveBusinessController(approveBusinessRepository, titanMailProvider);

const resendAccessRepository = new ResendAccessPrismaRepository();
const resendAccessController = new ResendAccessController(resendAccessRepository, titanMailProvider);

export { 
  listPartnerController,
  listEmployerController,
  getBusinessDetailController,
  getEmployerDetailsController,
  approveBusinessController,
  resendAccessController,
};
