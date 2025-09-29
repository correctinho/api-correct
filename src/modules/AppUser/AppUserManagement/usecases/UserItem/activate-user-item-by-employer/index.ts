import { BenefitGroupsPrismaRepository } from "../../../../../Company/BenefitGroups/repositories/implementations/benefit-groups.prisma.repository";
import { BusinessItemDetailsPrismaRepository } from "../../../../../Company/BusinessItemsDetails/repositories/implementations/business-item-details.prisma.repository";
import { AppUserItemPrismaRepository } from "../../../repositories/implementations-user-item/app-user-item-prisma.repository";
import { ActivateUserItemByEmployerController } from "./activate-user-item-by-employer.controller";

const appUserItemRepository = new AppUserItemPrismaRepository()
const benefitGroupsRepository = new BenefitGroupsPrismaRepository()
const businessItemRepository = new BusinessItemDetailsPrismaRepository()
const activateUserItemByEmployer = new ActivateUserItemByEmployerController(
  appUserItemRepository,
  benefitGroupsRepository,
  businessItemRepository
)

export { activateUserItemByEmployer }
