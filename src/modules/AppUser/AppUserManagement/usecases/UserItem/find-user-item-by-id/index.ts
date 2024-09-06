import { AppUserItemPrismaRepository } from "../../../repositories/implementations-user-item/app-user-item-prisma.repository";
import { FindUserItemByIdByController } from "./find-user-item-by-id.controller";

const appUserItemRepository = new AppUserItemPrismaRepository()
const findUserItemById = new FindUserItemByIdByController(appUserItemRepository)

export { findUserItemById }
