import { CompanyDataPrismaRepository } from "../../repositories/implementations/prisma/company-data-prisma.repository";
import { GetPartnerDetailsByAppUserController } from "./get-partner-details-by-app-user.controller";

const businessInfoRepository = new CompanyDataPrismaRepository()
const getPartnerDetailsByAppUser = new GetPartnerDetailsByAppUserController(businessInfoRepository)

export { getPartnerDetailsByAppUser }
