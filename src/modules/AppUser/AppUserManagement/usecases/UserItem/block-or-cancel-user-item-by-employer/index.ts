import { BenefitPrismaRepository } from "../../../../../benefits/repositories/implementations/benefit.prisma.repository";
import { AppUserItemPrismaRepository } from "../../../repositories/implementations-user-item/app-user-item-prisma.repository";
import { BlockOrCanceluserItemByEmployerController } from "./block-or-cancel-user-item-by-employer.controller";

const appUserItemRepository = new AppUserItemPrismaRepository()
const itemRepository = new BenefitPrismaRepository()

const blockOrCancelUserItemByEmployer = new BlockOrCanceluserItemByEmployerController(
  appUserItemRepository,
  itemRepository
)

export { blockOrCancelUserItemByEmployer }
