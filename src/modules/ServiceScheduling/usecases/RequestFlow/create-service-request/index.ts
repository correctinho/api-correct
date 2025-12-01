import { N8nNotifierProvider } from "../../../../../infra/providers/NotifierProvider/implementations/N8nNotifierProvider";
import { AppUserInfoPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { ProductPrismaRepository } from "../../../../Ecommerce/Products/repositories/implementations/product-prisma.repository";
import { ServiceRequestPrismaRepository } from "../../../repositories/implementations/ServiceRequestPrismaRepository";
import { CreateServiceRequestController } from "./CreateServiceRequestController";

const serviceRequestRepository = new ServiceRequestPrismaRepository()
const productsRepository = new ProductPrismaRepository(); 
const userInfoRepository = new AppUserInfoPrismaRepository(); 
const notifier = new N8nNotifierProvider();

const createServiceRequestController = new CreateServiceRequestController(
    serviceRequestRepository,
    productsRepository,
    userInfoRepository,
    notifier
)

export { createServiceRequestController}