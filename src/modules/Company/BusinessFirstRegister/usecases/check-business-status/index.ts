import { BusinessContractPrismaRepository } from "../../../../Terms/repositories/implementations/prisma-business-contract.repository";
import { BusinessRegisterPrismaRepository } from "../../repositories/implementations/business-first-register.prisma.repository";
import { CheckBusinessStatusController } from "./check-business-status.controller";
import { CheckBusinessStatusUseCase } from "./check-business-status.usecase";

const businessFirstRegisterRepository = new BusinessRegisterPrismaRepository();
const contractRepository = new BusinessContractPrismaRepository();
const checkBusinessStatusUseCase = new CheckBusinessStatusUseCase(businessFirstRegisterRepository, contractRepository);
const checkBusinessStatusController = new CheckBusinessStatusController(checkBusinessStatusUseCase);

export { checkBusinessStatusController };
