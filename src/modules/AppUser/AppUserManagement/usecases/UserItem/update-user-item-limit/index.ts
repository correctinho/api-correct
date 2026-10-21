
import { AppUserItemPrismaRepository } from "../../../repositories/implementations-user-item/app-user-item-prisma.repository";
import { UpdateUserItemLimitController } from "./update-user-item-limit.controller";
import { UpdateUserItemLimitUsecase } from "./update-user-item-limit.usecase";

const appUserItemRepository = new AppUserItemPrismaRepository();
const updateUserItemLimitUsecase = new UpdateUserItemLimitUsecase(appUserItemRepository);
const updateUserItemLimitController = new UpdateUserItemLimitController(updateUserItemLimitUsecase);

export { updateUserItemLimitController, updateUserItemLimitUsecase };
