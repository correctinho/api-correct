import { CompanyDataPrismaRepository } from "../../../CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { CompanyUserPrismaRepository } from "../../repositories/implementations/company-user.prisma.repository";
import { CreateCompanyUserByAdminController } from "./create-company-user-by-admin.controller";

const companyUserRepository = new CompanyUserPrismaRepository()
const companyUserByAdminController = new CreateCompanyUserByAdminController(
    companyUserRepository,
)

export { companyUserByAdminController }