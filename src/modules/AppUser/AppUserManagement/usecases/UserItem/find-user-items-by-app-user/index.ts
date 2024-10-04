import { CompanyDataPrismaRepository } from "../../../../../Company/CompanyData/repositories/implementations/prisma/company-data-prisma.repository"
import { AppUserInfoPrismaRepository } from "../../../repositories/implementations-user-info/app-user-info-prisma.repository"
import { AppUserItemPrismaRepository } from "../../../repositories/implementations-user-item/app-user-item-prisma.repository"
import { FindAllUserItemsByAppUserController } from "./find-user-items-by-app-user.controller"

const appUserItemRepository = new AppUserItemPrismaRepository()
const appUserInfoRepository = new AppUserInfoPrismaRepository()
const businessInfoRepository = new CompanyDataPrismaRepository()

const findAllUserItemsByUser = new FindAllUserItemsByAppUserController(
  appUserItemRepository,
  appUserInfoRepository,
)

export { findAllUserItemsByUser }
