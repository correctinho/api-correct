import { AppUserItemPrismaRepository } from "../../../repositories/implementations-user-item/app-user-item-prisma.repository";
import { ListCollaboratorsByBenefitController } from "./list-collaborators-by-benefit.controller";

const appUserItemRepository = new AppUserItemPrismaRepository()

const listCollaboratorsByBenefitController = new ListCollaboratorsByBenefitController(
    appUserItemRepository  
)

export { listCollaboratorsByBenefitController } 