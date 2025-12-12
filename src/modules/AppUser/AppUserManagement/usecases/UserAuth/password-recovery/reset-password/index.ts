import { AppUserAuthPrismaRepository } from "../../../../repositories/implementations-user-auth/app-user-auth-prisma.repository";
import { ResetPasswordController } from "./reset-password.controller";

const appUserAuthRepository = new AppUserAuthPrismaRepository()

const resetPasswordController = new ResetPasswordController(
    appUserAuthRepository
)

export { resetPasswordController };