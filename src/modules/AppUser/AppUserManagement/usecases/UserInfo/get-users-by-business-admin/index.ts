import { CompanyUserPrismaRepository } from "../../../../../Company/CompanyUser/repositories/implementations/company-user.prisma.repository";
import { AppUserInfoPrismaRepository } from "../../../repositories/implementations-user-info/app-user-info-prisma.repository";
import { GetUsersByBusinessAdminController } from "./get-users-by-business-admin.controller";

const appUserRepository = new AppUserInfoPrismaRepository()

const getUsersByAdmin = new GetUsersByBusinessAdminController(appUserRepository)

export { getUsersByAdmin }
