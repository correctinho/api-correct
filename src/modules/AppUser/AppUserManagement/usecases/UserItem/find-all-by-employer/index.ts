import { AppUserInfoPrismaRepository } from "../../../repositories/implementations-user-info/app-user-info-prisma.repository";
import { AppUserItemPrismaRepository } from "../../../repositories/implementations-user-item/app-user-item-prisma.repository";
import {  FindAllUserItemsByEmployeryController } from "./find-all-by-employer.controller";

const appUserItemRepository = new AppUserItemPrismaRepository()
const appUserInfoRepository = new AppUserInfoPrismaRepository()

const findAllUserItemsByemployer = new FindAllUserItemsByEmployeryController(appUserItemRepository, appUserInfoRepository)

export { findAllUserItemsByemployer}
