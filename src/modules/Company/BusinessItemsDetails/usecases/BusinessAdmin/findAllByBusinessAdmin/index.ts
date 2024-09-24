import { BusinessItemDetailsPrismaRepository } from "../../../repositories/implementations/business-item-details.prisma.repository";
import { FindAllEmployerItemDetailsByBusinessAdminController } from "./findAll-employer-item-details.controller";

const itemsDetailsRepository = new BusinessItemDetailsPrismaRepository()
const findAllEmployerItemDetailsBusinessAdmin = new FindAllEmployerItemDetailsByBusinessAdminController(itemsDetailsRepository)

export { findAllEmployerItemDetailsBusinessAdmin }
