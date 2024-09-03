import { CompanyDataPrismaRepository } from "../../../Company/CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { BenefitPrismaRepository } from "../../repositories/implementations/benefit.prisma.repository";
import { CreateCustomizedBenefitController } from "./create-customized-benefit.controller";

const benefitsRepository = new BenefitPrismaRepository()
const businessInfoRepository = new CompanyDataPrismaRepository()

const createCustomBenefitController = new CreateCustomizedBenefitController(
  benefitsRepository,
  businessInfoRepository
)

export { createCustomBenefitController }
