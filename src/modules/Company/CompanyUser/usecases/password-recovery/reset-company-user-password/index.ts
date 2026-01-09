import { CompanyUserPrismaRepository } from "../../../repositories/implementations/company-user.prisma.repository";
import { ResetCompanyPasswordController } from "./reset-company-user-password.controller";

const companyUserRepository = new CompanyUserPrismaRepository()

const resetCompanyUserPasswordController = new ResetCompanyPasswordController(
    companyUserRepository
);  

export { resetCompanyUserPasswordController };