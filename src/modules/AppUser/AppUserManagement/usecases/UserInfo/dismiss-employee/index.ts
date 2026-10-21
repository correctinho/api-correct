import { AppUserInfoPrismaRepository } from "../../../repositories/implementations-user-info/app-user-info-prisma.repository";
import { DismissEmployeeController } from "./dismiss-employee.controller";

const appUserInfoRepository = new AppUserInfoPrismaRepository();
const dismissEmployeeController = new DismissEmployeeController(appUserInfoRepository);

export { dismissEmployeeController };
