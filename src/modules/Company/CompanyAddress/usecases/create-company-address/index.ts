import { CompanyDataPrismaRepository } from "../../../CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { CompanyAddressPrismaRepository } from "../../repositories/implementations/company-address-prisma.repository";
import { CreateCompanyAddressController } from "./crate-company-address.controller";

const companyAddressRepository = new CompanyAddressPrismaRepository()

const createCompanyAddressController = new CreateCompanyAddressController(
    companyAddressRepository,
)

export { createCompanyAddressController }