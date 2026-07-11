import { BusinessRegisterPrismaRepository } from "../../repositories/implementations/business-first-register.prisma.repository";
import { CheckBusinessStatusController } from "./check-business-status.controller";
import { CheckBusinessStatusUseCase } from "./check-business-status.usecase";

const businessFirstRegisterRepository = new BusinessRegisterPrismaRepository();
const checkBusinessStatusUseCase = new CheckBusinessStatusUseCase(businessFirstRegisterRepository);
const checkBusinessStatusController = new CheckBusinessStatusController(checkBusinessStatusUseCase);

export { checkBusinessStatusController };
