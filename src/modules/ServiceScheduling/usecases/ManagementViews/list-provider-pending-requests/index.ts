import { AppUserInfoPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { ProductPrismaRepository } from "../../../../Ecommerce/Products/repositories/implementations/product-prisma.repository";
import { ServiceRequestPrismaRepository } from "../../../repositories/implementations/ServiceRequestPrismaRepository";
import { ListProviderPendingRequestsController } from "./ListProviderPendingRequestsController";

const serviceRequestRepository = new ServiceRequestPrismaRepository();
const appUserInfoRepository = new AppUserInfoPrismaRepository();
const productsRepository = new ProductPrismaRepository()

const listProviderPendingController = new ListProviderPendingRequestsController(
    serviceRequestRepository,
    appUserInfoRepository,
    productsRepository
);

export { listProviderPendingController };