
import { BenefitPrismaRepository } from "../../../../benefits/repositories/implementations/benefit.prisma.repository";
import { BusinessItemDetailsPrismaRepository } from "../../../../Company/BusinessItemsDetails/repositories/implementations/business-item-details.prisma.repository";
import { CompanyDataPrismaRepository } from "../../../../Company/CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { AppUserAuthPrismaRepository } from "../../../AppUserManagement/repositories/implementations-user-auth/app-user-auth-prisma.repository";
import { AppUserInfoPrismaRepository } from "../../../AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { AppUserItemPrismaRepository } from "../../../AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { CreateAppUserByCorrectController } from "./create-appuser-data-by-correct.controller";

const appUserInfoRepository = new AppUserInfoPrismaRepository()
const businessRepository = new CompanyDataPrismaRepository()
const appUserAuthRepository = new AppUserAuthPrismaRepository()
const employerItemsReposutory = new BusinessItemDetailsPrismaRepository()
const employeeItemRepository = new AppUserItemPrismaRepository()
const benefitsRepository = new BenefitPrismaRepository()
const createAppUserByCorrectController = new CreateAppUserByCorrectController(
    appUserInfoRepository,
    businessRepository,
    appUserAuthRepository,
    employerItemsReposutory,
    employeeItemRepository,
    benefitsRepository
)

export { createAppUserByCorrectController }
