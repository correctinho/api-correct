import { TitanMailProvider } from "../../../../../../../infra/providers/MailProvider/implementations/TitanMailProvider";
import { AppUserAuthPrismaRepository } from "../../../../repositories/implementations-user-auth/app-user-auth-prisma.repository";
import { SendForgotPasswordController } from "./send-forgot-password-mail.controller";

const appUserAuthRepositry = new AppUserAuthPrismaRepository();
const mailProvider = new TitanMailProvider();

const sendForgotPassword = new SendForgotPasswordController(
    appUserAuthRepositry,
    mailProvider
);

export { sendForgotPassword };