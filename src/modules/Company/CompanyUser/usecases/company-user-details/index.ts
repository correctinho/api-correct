import { ProductPrismaRepository } from "../../../../Ecommerce/Products/repositories/implementations/product-prisma.repository";
import { ServiceRequestPrismaRepository } from "../../../../ServiceScheduling/repositories/implementations/ServiceRequestPrismaRepository";
import { CompanyUserPrismaRepository } from "../../repositories/implementations/company-user.prisma.repository";
import { CompanyUserDetailsController } from "./company-user-details.controller";

const serviceRequestRepository = new ServiceRequestPrismaRepository()
const productRepository = new ProductPrismaRepository()
const companyUserDetailsController = new CompanyUserDetailsController(
    serviceRequestRepository,
    productRepository
)

export { companyUserDetailsController }