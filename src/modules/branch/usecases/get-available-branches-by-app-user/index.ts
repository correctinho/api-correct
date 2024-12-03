import { BranchPrismaRepository } from '../../repositories/implementations/branch.prisma.repository';
import { GetAvailableBranchesByAppUserController } from './get-available-branches-by-app-user.controller';

const branchRepository = new BranchPrismaRepository();
const getAvailableBranchesByAppUser = new GetAvailableBranchesByAppUserController(branchRepository);

export { getAvailableBranchesByAppUser };
