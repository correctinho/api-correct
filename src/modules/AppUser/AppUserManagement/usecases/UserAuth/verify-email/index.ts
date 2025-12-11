import { AppUserAuthPrismaRepository } from "../../../repositories/implementations-user-auth/app-user-auth-prisma.repository";
import { VerifyEmailController } from "./verify-email.controller";

const appUserAuthRepository = new AppUserAuthPrismaRepository()

const verifyEmailController = new VerifyEmailController(appUserAuthRepository)

export { verifyEmailController };