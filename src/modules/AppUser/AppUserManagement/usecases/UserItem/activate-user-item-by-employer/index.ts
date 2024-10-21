import { BenefitGroupsPrismaRepository } from "../../../../../Company/BenefitGroups/repositories/implementations/benefit-groups.prisma.repository";
import { AppUserItemPrismaRepository } from "../../../repositories/implementations-user-item/app-user-item-prisma.repository";
import { ActivateUserItemByEmployerController } from "./activate-user-item-by-employer.controller";

const appUserItemRepository = new AppUserItemPrismaRepository()
const benefitGroupsRepository = new BenefitGroupsPrismaRepository()

const activateUserItemByEmployer = new ActivateUserItemByEmployerController(
  appUserItemRepository,
  benefitGroupsRepository
)

export { activateUserItemByEmployer }
