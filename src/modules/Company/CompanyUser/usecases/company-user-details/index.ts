import { ProductPrismaRepository } from "../../../../Ecommerce/Products/repositories/implementations/product-prisma.repository";
import { ServiceRequestPrismaRepository } from "../../../../ServiceScheduling/repositories/implementations/ServiceRequestPrismaRepository";
import { CompanyDataPrismaRepository } from "../../../CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { BusinessContractPrismaRepository } from "../../../../Terms/repositories/implementations/prisma-business-contract.repository";
import { CompanyUserDetailsController } from "./company-user-details.controller";

const serviceRequestRepository = new ServiceRequestPrismaRepository()
const productRepository = new ProductPrismaRepository()
const companyDataRepository = new CompanyDataPrismaRepository()
const contractRepository = new BusinessContractPrismaRepository()

const companyUserDetailsController = new CompanyUserDetailsController(
    serviceRequestRepository,
    productRepository,
    companyDataRepository,
    contractRepository
)

export { companyUserDetailsController }
