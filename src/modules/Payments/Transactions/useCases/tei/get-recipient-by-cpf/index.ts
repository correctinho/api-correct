import { AppUserInfoPrismaRepository } from "../../../../../AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { GetRecipientByCpfController } from "./get-recipient-by-cpf.controller";

const appUserInfoRepository = new AppUserInfoPrismaRepository();

const getRecipientController = new GetRecipientByCpfController(
    appUserInfoRepository
);

export { getRecipientController };