import { BenefitPrismaRepository } from "../../../../../benefits/repositories/implementations/benefit.prisma.repository"
import { AppUserInfoPrismaRepository } from "../../../repositories/implementations-user-info/app-user-info-prisma.repository"
import { AppUserItemPrismaRepository } from "../../../repositories/implementations-user-item/app-user-item-prisma.repository"
import { CreateUserInfoController } from "./create-user-info.controller"

const benefitsRepository = new BenefitPrismaRepository()
const appUserInfoRepository = new AppUserInfoPrismaRepository()

const createUserInfoController = new CreateUserInfoController(appUserInfoRepository, benefitsRepository)

export { createUserInfoController }
