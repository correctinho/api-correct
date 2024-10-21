import { AppUserInfoPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { BusinessItemDetailsPrismaRepository } from "../../../BusinessItemsDetails/repositories/implementations/business-item-details.prisma.repository";
import { BenefitGroupsPrismaRepository } from "../../repositories/implementations/benefit-groups.prisma.repository";
import { UpdateBenefitGroupController } from "./update-benefit-groups.controller";

const benefitGroupsRepository = new BenefitGroupsPrismaRepository()
const userInfoRepository = new AppUserInfoPrismaRepository()
const employerItemsRepository = new BusinessItemDetailsPrismaRepository()

const updateBenefitGroupController = new UpdateBenefitGroupController(
  benefitGroupsRepository,
  userInfoRepository,
  employerItemsRepository
)

export { updateBenefitGroupController }
