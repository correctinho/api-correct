import { CompanyDataPrismaRepository } from "../../../CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { BusinessContractPrismaRepository } from "../../../../Terms/repositories/implementations/prisma-business-contract.repository";
import { GenerateBusinessContractUsecase } from "../../../../Terms/usecase/generate-business-contract/generate-business-contract.usecase";
import { GetPublicContractController } from "./get-public-contract.controller";

const businessInfoRepository = new CompanyDataPrismaRepository();
const businessContractRepository = new BusinessContractPrismaRepository();
const generateBusinessContractUsecase = new GenerateBusinessContractUsecase(businessContractRepository);

const getPublicContractController = new GetPublicContractController(
    businessInfoRepository,
    businessContractRepository,
    generateBusinessContractUsecase
);

export { getPublicContractController };
