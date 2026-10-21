import { CompanyDataPrismaRepository } from "../../../CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { BusinessContractPrismaRepository } from "../../../../Terms/repositories/implementations/prisma-business-contract.repository";
import { SignPublicContractController } from "./sign-public-contract.controller";

const businessInfoRepository = new CompanyDataPrismaRepository();
const businessContractRepository = new BusinessContractPrismaRepository();

const signPublicContractController = new SignPublicContractController(
    businessInfoRepository,
    businessContractRepository
);

export { signPublicContractController };
