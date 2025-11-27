import { CompanyDataPrismaRepository } from "../../../../../Company/CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { OfflineTokensPrismaRepository } from "../../../../../Payments/OfflineTokens/repositories/implementations/offline-tokens.prisma.repository";
import { AppUserInfoPrismaRepository } from "../../../repositories/implementations-user-info/app-user-info-prisma.repository";
import { GetUserInfoByUserController } from "./get-user-info-by-user.controller";

const appUserRepository = new AppUserInfoPrismaRepository()
const offlineTokenRepository = new OfflineTokensPrismaRepository()

const getUserInfobyUser = new GetUserInfoByUserController(appUserRepository, offlineTokenRepository)

export { getUserInfobyUser }