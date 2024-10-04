import { CompanyDataPrismaRepository } from "../../../../../Company/CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { AppUserInfoPrismaRepository } from "../../../repositories/implementations-user-info/app-user-info-prisma.repository";
import { AppUserItemPrismaRepository } from "../../../repositories/implementations-user-item/app-user-item-prisma.repository";
import { FindUserItemByIdByController } from "./find-user-item-by-id.controller";

const appUserItemRepository = new AppUserItemPrismaRepository()
const appUserInfoRepository = new AppUserInfoPrismaRepository()
const businessInfoRepository = new CompanyDataPrismaRepository()

const findUserItemById = new FindUserItemByIdByController(
  appUserItemRepository,
  appUserInfoRepository
)

export { findUserItemById }
