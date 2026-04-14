import { BenefitGroupsPrismaRepository } from "../../repositories/implementations/benefit-groups.prisma.repository";
import { BusinessItemDetailsPrismaRepository } from "../../../BusinessItemsDetails/repositories/implementations/business-item-details.prisma.repository";
import { UpdateDefaultBenefitValueController } from "./update-default-benefit-value.controller";

const benefitGroupsRepository = new BenefitGroupsPrismaRepository();
const businessItemDetailsRepository = new BusinessItemDetailsPrismaRepository();

const updateDefaultBenefitValueController = new UpdateDefaultBenefitValueController(
  benefitGroupsRepository,
  businessItemDetailsRepository
);

export { updateDefaultBenefitValueController };
