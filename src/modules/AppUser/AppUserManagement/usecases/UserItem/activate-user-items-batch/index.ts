import { AppUserItemPrismaRepository } from "../../../repositories/implementations-user-item/app-user-item-prisma.repository";
import { ActivateUserItemsBatchController } from "./activate-user-items-batch.controller";

const appUserItemRepository = new AppUserItemPrismaRepository();

const activateUserItemsBatchController = new ActivateUserItemsBatchController(
    appUserItemRepository
); 

export { activateUserItemsBatchController };