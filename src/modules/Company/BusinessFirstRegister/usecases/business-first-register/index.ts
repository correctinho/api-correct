import { BenefitPrismaRepository } from "../../../../benefits/repositories/implementations/benefit.prisma.repository";
import { BranchPrismaRepository } from "../../../../branch/repositories/implementations/branch.prisma.repository";
import { CompanyDataPrismaRepository } from "../../../CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { BusinessRegisterPrismaRepository } from "../../repositories/implementations/business-first-register.prisma.repository";
import { CreateBusinessRegisterController } from "./business-first-register.controller";

const businessRegisterRepository = new BusinessRegisterPrismaRepository()
const companyDataRepository = new CompanyDataPrismaRepository()
const branchRepository = new BranchPrismaRepository()
const itemRepository = new BenefitPrismaRepository()
const businessRegisterController = new CreateBusinessRegisterController(businessRegisterRepository, companyDataRepository, branchRepository, itemRepository)

export { businessRegisterController }
