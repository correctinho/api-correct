import { CompanyDataPrismaRepository } from "../../../CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { BusinessRegisterPrismaRepository } from "../../repositories/implementations/business-first-register.prisma.repository";
import { CreateBusinessRegisterController } from "./business-first-register.controller";

const businessRegisterRepository = new BusinessRegisterPrismaRepository()
const companyDataRepository = new CompanyDataPrismaRepository()

const businessRegisterController = new CreateBusinessRegisterController(businessRegisterRepository, companyDataRepository)

export { businessRegisterController }