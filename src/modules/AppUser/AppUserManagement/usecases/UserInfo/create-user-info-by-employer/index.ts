import { BenefitPrismaRepository } from "../../../../../benefits/repositories/implementations/benefit.prisma.repository"
import { BusinessItemDetailsPrismaRepository } from "../../../../../Company/BusinessItemsDetails/repositories/implementations/business-item-details.prisma.repository"
import { AppUserAuthPrismaRepository } from "../../../repositories/implementations-user-auth/app-user-auth-prisma.repository"
import { AppUserInfoPrismaRepository } from "../../../repositories/implementations-user-info/app-user-info-prisma.repository"
import { AppUserItemPrismaRepository } from "../../../repositories/implementations-user-item/app-user-item-prisma.repository"
import { CreateUserInfoController } from "../create-user-info/create-user-info.controller"
import { CreateUserInfoByEmployerController } from "./create-user-info-by-employer.controller"

const appUserAuthRepository = new AppUserAuthPrismaRepository()
const appUserInfoRepository = new AppUserInfoPrismaRepository()
const employerItemsRepository = new BusinessItemDetailsPrismaRepository()
const benefitsRepository = new BenefitPrismaRepository()


const createUserInfoByEmployerController = new CreateUserInfoByEmployerController(
  appUserInfoRepository,
  appUserAuthRepository,
  employerItemsRepository,
  benefitsRepository
)

export { createUserInfoByEmployerController }
