import { SetBenefitsToBranchController } from './set-benefits-to-branch.controller';
import { BranchPrismaRepository } from '../../repositories/implementations/branch.prisma.repository';
import { BenefitPrismaRepository } from '../../../benefits/repositories/implementations/benefit.prisma.repository';

const branchRepository = new BranchPrismaRepository();
const benefitsRepository = new BenefitPrismaRepository();

const setBenefitsToBranchController = new SetBenefitsToBranchController(
  branchRepository,
  benefitsRepository
);

export { setBenefitsToBranchController };
