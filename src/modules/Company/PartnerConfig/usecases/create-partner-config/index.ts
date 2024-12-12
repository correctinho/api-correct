import { BranchPrismaRepository } from "../../../../branch/repositories/implementations/branch.prisma.repository";
import { CompanyDataPrismaRepository } from "../../../CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { PartnerConfigPrismaRepository } from "../../repositories/implementations/prisma/partner-config-prisma.repository";
import { CreatePartnerConfigController } from "./create-partner-config.controller";

const businessInfoRepository = new CompanyDataPrismaRepository()
const branchInfoRepository = new BranchPrismaRepository()
const partnerConfigRepository = new PartnerConfigPrismaRepository()

const createPartnerConfigController = new CreatePartnerConfigController(
  businessInfoRepository,
  branchInfoRepository,
  partnerConfigRepository
)

export { createPartnerConfigController }
