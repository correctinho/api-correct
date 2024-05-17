
import { CompanyDataPrismaRepository } from "../../../../Company/CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { AppUserInfoPrismaRepository } from "../../../AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { CreateAppUserByCorrectController } from "./create-appuser-data-by-correct.controller";

const appUserInfoRepository = new AppUserInfoPrismaRepository()
const businessRepository = new CompanyDataPrismaRepository()

const createAppUserByCorrectController = new CreateAppUserByCorrectController(
    appUserInfoRepository,
    businessRepository
)

export { createAppUserByCorrectController }