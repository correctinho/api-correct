import { BusinessItemDetailsPrismaRepository } from "../../../repositories/implementations/business-item-details.prisma.repository";
import { FindAllEmployerItemDetailsController } from "./findAll-employer-item-details.controller";

const itemsDetailsRepository = new BusinessItemDetailsPrismaRepository()
const findAllEmployerItemDetails = new FindAllEmployerItemDetailsController(itemsDetailsRepository)

export { findAllEmployerItemDetails }
