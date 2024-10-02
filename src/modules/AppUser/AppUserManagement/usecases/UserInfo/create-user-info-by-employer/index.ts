import { AppUserAuthPrismaRepository } from "../../../repositories/implementations-user-auth/app-user-auth-prisma.repository"
import { AppUserInfoPrismaRepository } from "../../../repositories/implementations-user-info/app-user-info-prisma.repository"
import { CreateUserInfoController } from "../create-user-info/create-user-info.controller"
import { CreateUserInfoByEmployerController } from "./create-user-info-by-employer.controller"

const appUserAuthRepository = new AppUserAuthPrismaRepository()
const appUserInfoRepository = new AppUserInfoPrismaRepository()

const createUserInfoByEmployerController = new CreateUserInfoByEmployerController(appUserInfoRepository, appUserAuthRepository)

export { createUserInfoByEmployerController }
