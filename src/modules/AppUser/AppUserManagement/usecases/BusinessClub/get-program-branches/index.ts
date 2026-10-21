import { PrismaBusinessClubRepository } from '../../../repositories/implementations-business-club/prisma-business-club.repository';
import { GetProgramBranchesUseCase } from './get-program-branches.usecase';
import { GetProgramBranchesController } from './get-program-branches.controller';

const prismaBusinessClubRepository = new PrismaBusinessClubRepository();
const getProgramBranchesUseCase = new GetProgramBranchesUseCase(prismaBusinessClubRepository);
const getProgramBranchesController = new GetProgramBranchesController(getProgramBranchesUseCase);

export { getProgramBranchesController };
