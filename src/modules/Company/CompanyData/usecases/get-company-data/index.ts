import { BusinessContractPrismaRepository } from "../../../../Terms/repositories/implementations/prisma-business-contract.repository";
import { CompanyDataPrismaRepository } from "../../repositories/implementations/prisma/company-data-prisma.repository";
import { GetCompanyDataController } from "./get-company-data.controller";

const companyDataRepository = new CompanyDataPrismaRepository()
const contractRepository = new BusinessContractPrismaRepository();
const getCompanyDataController = new GetCompanyDataController(companyDataRepository, contractRepository);

export { getCompanyDataController }