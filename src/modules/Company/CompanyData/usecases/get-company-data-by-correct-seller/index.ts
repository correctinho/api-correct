import { CompanyDataPrismaRepository } from "../../repositories/implementations/prisma/company-data-prisma.repository";
import { GetRegisteredBusinessByCorrectSellerController } from "./get-registered-business-by-correct-seller.controller";

const companyDataRepository = new CompanyDataPrismaRepository()
const getRegisterPartnerBySeller = new GetRegisteredBusinessByCorrectSellerController(companyDataRepository)

export { getRegisterPartnerBySeller }
