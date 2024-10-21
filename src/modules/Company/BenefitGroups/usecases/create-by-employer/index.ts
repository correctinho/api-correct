import { AppUserInfoPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { BusinessItemDetailsPrismaRepository } from "../../../BusinessItemsDetails/repositories/implementations/business-item-details.prisma.repository";
import { BenefitGroupsPrismaRepository } from "../../repositories/implementations/benefit-groups.prisma.repository";
import { CreateBenefitGroupController } from "./create-benefit-groups.controller";

const benefitGroupsRepository = new BenefitGroupsPrismaRepository()
const userInfoRepository = new AppUserInfoPrismaRepository()
const employerItemsRepository = new BusinessItemDetailsPrismaRepository()

const createBenefitGroupController = new CreateBenefitGroupController(
  benefitGroupsRepository,
  userInfoRepository,
  employerItemsRepository
)

export { createBenefitGroupController }
