import { BusinessItemDetailsPrismaRepository } from "../../../../../Company/BusinessItemsDetails/repositories/implementations/business-item-details.prisma.repository";
import { AppUserInfoPrismaRepository } from "../../../repositories/implementations-user-info/app-user-info-prisma.repository";
import { AppUserItemPrismaRepository } from "../../../repositories/implementations-user-item/app-user-item-prisma.repository";
import { CreateAppUserItemByEmployerController } from "./create-user-item-by-employer.controller";

const appUserItemRepository = new AppUserItemPrismaRepository()
const appUserInfoRepository = new AppUserInfoPrismaRepository()
const employerItemDetailsRepository = new BusinessItemDetailsPrismaRepository()

const createAppUserItemController = new CreateAppUserItemByEmployerController(
  appUserItemRepository,
  appUserInfoRepository,
  employerItemDetailsRepository
)

export { createAppUserItemController }
