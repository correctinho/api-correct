import { AppUserInfoPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { BusinessItemDetailsPrismaRepository } from "../../../BusinessItemsDetails/repositories/implementations/business-item-details.prisma.repository";
import { BenefitGroupsPrismaRepository } from "../../repositories/implementations/benefit-groups.prisma.repository";
import { GetOneBenefitGroupsByEmployerController } from "./get-one-by-employer.controller";

const benefitGroupsRepository = new BenefitGroupsPrismaRepository()

const getOneBenefitGroupsController = new GetOneBenefitGroupsByEmployerController(
  benefitGroupsRepository,

)

export { getOneBenefitGroupsController }
