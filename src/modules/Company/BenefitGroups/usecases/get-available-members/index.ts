import { AppUserInfoPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { BusinessItemDetailsPrismaRepository } from "../../../BusinessItemsDetails/repositories/implementations/business-item-details.prisma.repository";
import { BenefitGroupsPrismaRepository } from "../../repositories/implementations/benefit-groups.prisma.repository";
import { GetAvailableMembersController } from "./get-available-members.controller";

const appUserInfoRepository = new AppUserInfoPrismaRepository();
const benefitGroupsRepository = new BenefitGroupsPrismaRepository();
const businessItemDetailsRepository = new BusinessItemDetailsPrismaRepository();

const getAvailableMembersController = new GetAvailableMembersController(
  appUserInfoRepository,
  benefitGroupsRepository,
  businessItemDetailsRepository
);

export { getAvailableMembersController };