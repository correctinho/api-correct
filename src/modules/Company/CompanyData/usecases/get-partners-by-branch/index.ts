import { CompanyDataPrismaRepository } from "../../repositories/implementations/prisma/company-data-prisma.repository";
import { GetPartnersByBranchController } from "./get-partner-by-branch.controller";

const businessInfoRepository = new CompanyDataPrismaRepository()
const getPartnersByBranch = new GetPartnersByBranchController(businessInfoRepository)

export { getPartnersByBranch }
