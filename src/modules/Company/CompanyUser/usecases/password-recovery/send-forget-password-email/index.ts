import { TitanMailProvider } from "../../../../../../infra/providers/MailProvider/implementations/TitanMailProvider";
import { CompanyUserPrismaRepository } from "../../../repositories/implementations/company-user.prisma.repository";
import { SendCompanyForgotPasswordMailController } from "./send-forget-password-email.controller";

const companyUserRepository = new CompanyUserPrismaRepository()
const titanEmailProvider = new TitanMailProvider()

const sendCompanyPasswordController = new SendCompanyForgotPasswordMailController(
    companyUserRepository,
    titanEmailProvider
);

export { sendCompanyPasswordController };