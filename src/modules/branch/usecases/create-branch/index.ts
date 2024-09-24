import { BenefitPrismaRepository } from '../../../benefits/repositories/implementations/benefit.prisma.repository';
import { BranchPrismaRepository } from '../../repositories/implementations/branch.prisma.repository';
import { CreateBranchController } from './create-branch.controller';

const branchRepository = new BranchPrismaRepository();
const benefitsRepository = new BenefitPrismaRepository()
const createBranchController = new CreateBranchController(branchRepository, benefitsRepository);

export { createBranchController };
