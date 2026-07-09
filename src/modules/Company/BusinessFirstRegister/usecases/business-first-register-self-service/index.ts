import { BranchPrismaRepository } from "../../../../branch/repositories/implementations/branch.prisma.repository";
import { CompanyDataPrismaRepository } from "../../../CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { BusinessRegisterPrismaRepository } from "../../repositories/implementations/business-first-register.prisma.repository";
import { CreateBusinessRegisterSelfServiceController } from "./business-first-register-self-service.controller";

const businessRegisterRepository = new BusinessRegisterPrismaRepository()
const companyDataRepository = new CompanyDataPrismaRepository()
const branchRepository = new BranchPrismaRepository()
const businessRegisterSelfServiceController = new CreateBusinessRegisterSelfServiceController(businessRegisterRepository, companyDataRepository, branchRepository)

export { businessRegisterSelfServiceController }
