import { CompanyDataPrismaRepository } from "../../../CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { CompanyAddressPrismaRepository } from "../../repositories/implementations/company-address-prisma.repository";
import { UpdateCompanyDataAndAddressByAdminController } from "./update-company-address-by-admin.controller";

const companyAddressRepository = new CompanyAddressPrismaRepository()
const companyDataRepository = new CompanyDataPrismaRepository()
const updateAddressController = new UpdateCompanyDataAndAddressByAdminController(
    companyAddressRepository,
    companyDataRepository
    )

export { updateAddressController }
