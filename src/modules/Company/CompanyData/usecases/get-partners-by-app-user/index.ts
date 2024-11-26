import { CompanyDataPrismaRepository } from "../../repositories/implementations/prisma/company-data-prisma.repository";
import { GetPartnersByAppUserController } from "./get-partner-by-app-user.controller";

const businessInfoRepository = new CompanyDataPrismaRepository()
const getPartnersByAppUser = new GetPartnersByAppUserController(businessInfoRepository)

export { getPartnersByAppUser }
