import { PasswordBcrypt } from "../../../../../crypto/password.bcrypt";
import { CompanyUserPrismaRepository } from "../../repositories/implementations/company-user.prisma.repository";
import { UpdateAdminByAdminController } from "../update-admin-by-admin/update-admin-by-admin.controller";

const companyUserRepository = new CompanyUserPrismaRepository()
const passwordCrypto = new PasswordBcrypt()
const updateAdminController = new UpdateAdminByAdminController(companyUserRepository, passwordCrypto)
export { updateAdminController }
