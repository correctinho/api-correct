import { BenefitPrismaRepository } from "../../../../../benefits/repositories/implementations/benefit.prisma.repository";
import { CompanyDataPrismaRepository } from "../../../../CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { BusinessItemDetailsPrismaRepository } from "../../../repositories/implementations/business-item-details.prisma.repository";
import { CreateEmployerItemByCorrectController } from "./create-employer-item-by-correct.controller";

const itemDetailsRepository = new BusinessItemDetailsPrismaRepository()
const benefitsRepository = new BenefitPrismaRepository()
const businessRepository = new CompanyDataPrismaRepository()

const createEmployerItemDetails = new CreateEmployerItemByCorrectController(
  itemDetailsRepository,
  benefitsRepository,
  businessRepository
)

export { createEmployerItemDetails }
