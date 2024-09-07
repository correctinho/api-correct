import { PasswordBcrypt } from "../../../../../crypto/password.bcrypt";
import { CompanyUserPrismaRepository } from "../../repositories/implementations/company-user.prisma.repository";
import { UpdateUserbyAdminController } from "./update-user-by-admin.controller";

const companyUserRepository = new CompanyUserPrismaRepository()
const passwordCrypto = new PasswordBcrypt()
const updateUserController = new UpdateUserbyAdminController(companyUserRepository, passwordCrypto)
export { updateUserController }
