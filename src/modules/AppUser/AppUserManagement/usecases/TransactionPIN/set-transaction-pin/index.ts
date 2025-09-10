import { PasswordBCrypt } from "../../../../../../infra/shared/crypto/password.bcrypt"
import { AppUserAuthPrismaRepository } from "../../../repositories/implementations-user-auth/app-user-auth-prisma.repository"
import { SetAppUserTransactionPinController } from "./set-transaction-pin.controller"

const appUserAuthRepository = new AppUserAuthPrismaRepository()
const hashService = new PasswordBCrypt()

const setTransactionPinController = new SetAppUserTransactionPinController(
    appUserAuthRepository,
    hashService
)

export { setTransactionPinController }