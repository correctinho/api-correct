import { BenefitPrismaRepository } from "../../../../../benefits/repositories/implementations/benefit.prisma.repository";
import { BusinessItemDetailsPrismaRepository } from "../../../repositories/implementations/business-item-details.prisma.repository";
import { FindEmployerItemDetailsController } from "./find-employer-item-details.controller";

const itemsDetailsRepository = new BusinessItemDetailsPrismaRepository()
const itemsRepository = new BenefitPrismaRepository()
const findEmployerItemDetailsByBusiness = new FindEmployerItemDetailsController(itemsDetailsRepository, itemsRepository)

export { findEmployerItemDetailsByBusiness }
