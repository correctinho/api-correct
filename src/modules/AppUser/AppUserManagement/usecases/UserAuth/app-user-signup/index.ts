import { AppUserInfoPrismaRepository } from "../../../repositories/implementations-user-info/app-user-info-prisma.repository";
import { AppUserAuthPrismaRepository } from "../../../repositories/implementations-user-auth/app-user-auth-prisma.repository";
import { AppUserAuthSignUpController } from "./app-user-auth-signup.controller";
import { TitanMailProvider } from "../../../../../../infra/providers/MailProvider/implementations/TitanMailProvider";

const appUserRepository = new AppUserAuthPrismaRepository()
const appUserInfoRepository = new AppUserInfoPrismaRepository()
const titanEmail = new TitanMailProvider()

const appUserAuthSignUpController = new AppUserAuthSignUpController(
    appUserRepository, 
    appUserInfoRepository,
    titanEmail
)

export { appUserAuthSignUpController }