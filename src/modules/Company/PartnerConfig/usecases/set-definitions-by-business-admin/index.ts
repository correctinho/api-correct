import { BranchPrismaRepository } from "../../../../branch/repositories/implementations/branch.prisma.repository";
import { CompanyDataPrismaRepository } from "../../../CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { PartnerConfigPrismaRepository } from "../../repositories/implementations/prisma/partner-config-prisma.repository";
import { SetDefinitionsByBusinessAdminController } from "./set-definitions-by-business-admincontroller";

const businessInfoRepository = new CompanyDataPrismaRepository()
const branchInfoRepository = new BranchPrismaRepository()
const partnerConfigRepository = new PartnerConfigPrismaRepository()

const setDefinitionsByBusinessAdminController = new SetDefinitionsByBusinessAdminController(
  businessInfoRepository,
  branchInfoRepository,
  partnerConfigRepository
)

export { setDefinitionsByBusinessAdminController }
