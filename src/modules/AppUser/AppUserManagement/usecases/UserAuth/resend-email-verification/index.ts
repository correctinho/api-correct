import { TitanMailProvider } from "../../../../../../infra/providers/MailProvider/implementations/TitanMailProvider";
import { AppUserAuthPrismaRepository } from "../../../repositories/implementations-user-auth/app-user-auth-prisma.repository";
import { ResendVerificationController } from "./resend-verification.controller";

const appUserAuthRepository = new AppUserAuthPrismaRepository();
const emailProvider = new TitanMailProvider()

const resendEmailVerificationController = new ResendVerificationController(
    appUserAuthRepository,
    emailProvider
);

export { resendEmailVerificationController };