import { BusinessContractPrismaRepository } from "../../repositories/implementations/prisma-business-contract.repository";
import { GetPendingBusinessContractController } from "./get-pending-business-contract.controller";

const businessContractRepository = new BusinessContractPrismaRepository()

const getPendingBusinessContractController = new GetPendingBusinessContractController(
    businessContractRepository
)

export { getPendingBusinessContractController }
