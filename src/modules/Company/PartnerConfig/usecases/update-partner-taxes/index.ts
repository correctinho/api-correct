import { PartnerConfigPrismaRepository } from "../../repositories/implementations/prisma/partner-config-prisma.repository";
import { CompanyDataPrismaRepository } from "../../../CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { BusinessContractPrismaRepository } from "../../../../Terms/repositories/implementations/prisma-business-contract.repository";
import { UpdatePartnerTaxesController } from "./update-partner-taxes.controller";
import { GenerateBusinessContractUsecase } from "../../../../Terms/usecase/generate-business-contract/generate-business-contract.usecase";

const partnerConfigRepository = new PartnerConfigPrismaRepository();
const businessInfoRepository = new CompanyDataPrismaRepository();
const businessContractRepository = new BusinessContractPrismaRepository();
const generateContractUsecase = new GenerateBusinessContractUsecase(businessContractRepository);

const updatePartnerTaxesController = new UpdatePartnerTaxesController(
    partnerConfigRepository,
    businessInfoRepository,
    businessContractRepository,
    generateContractUsecase
);

export { updatePartnerTaxesController };
