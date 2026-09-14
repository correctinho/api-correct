import { AppUserAddressPrismaRepository } from "../../../AppUserManagement/repositories/implementations-user-address/app-user-address-prisma.repository";
import { AppUserInfoPrismaRepository } from "../../../AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { GetAppUserOverviewByAdminController } from "./get-app-user-overview-by-admin.controller";
import { GetAppUserOverviewByAdminUsecase } from "./get-app-user-overview-by-admin.usecase";

const appUserInfoRepository = new AppUserInfoPrismaRepository();
const appUserAddressRepository = new AppUserAddressPrismaRepository();

const getAppUserOverviewByAdminUsecase = new GetAppUserOverviewByAdminUsecase(appUserInfoRepository, appUserAddressRepository);
const getAppUserOverviewByAdminController = new GetAppUserOverviewByAdminController(getAppUserOverviewByAdminUsecase);

export { getAppUserOverviewByAdminController };
