import { BusinessItemDetailsPrismaRepository } from "../../repositories/implementations/business-item-details.prisma.repository";
import { FindEmployerItemDetailsController } from "./find-employer-item-details.controller";

const itemsDetailsRepository = new BusinessItemDetailsPrismaRepository()
const findEmployerItemDetails = new FindEmployerItemDetailsController(itemsDetailsRepository)

export { findEmployerItemDetails }
