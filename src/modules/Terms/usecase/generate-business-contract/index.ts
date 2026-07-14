import { BusinessContractPrismaRepository } from "../../repositories/implementations/prisma-business-contract.repository";
import { GenerateBusinessContractController } from "./generate-business-contract.controller";

const generateBusinessContractRepository = new BusinessContractPrismaRepository();

const generateBusinessContractController = new GenerateBusinessContractController(
    generateBusinessContractRepository
);

export { generateBusinessContractController };
