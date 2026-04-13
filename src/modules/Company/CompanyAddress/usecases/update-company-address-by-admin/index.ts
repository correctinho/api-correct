import { CompanyAddressPrismaRepository } from "../../repositories/implementations/company-address-prisma.repository";
import { UpdateCompanyDataAndAddressByAdminController } from "./update-company-address-by-admin.controller";

const companyAddressRepository = new CompanyAddressPrismaRepository()
const updateAddressController = new UpdateCompanyDataAndAddressByAdminController(
    companyAddressRepository,
)

export { updateAddressController }
