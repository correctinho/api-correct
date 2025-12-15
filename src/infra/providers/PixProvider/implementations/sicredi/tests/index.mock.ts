import { SicrediMockPixProvider } from "./MockPixProvider";
import { AppUserInfoPrismaRepository } from "../../../../../../modules/AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { AppUserItemPrismaRepository } from "../../../../../../modules/AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { TransactionOrderPrismaRepository } from "../../../../../../modules/Payments/Transactions/repositories/implementations/transaction-order-prisma.repository";
import { CreatePixChargeController } from "../../../../../../modules/Payments/Pix/usecases/create-pix-charge-by-app-user/create-pix-charge-by-app-user.controller";
import { TitanMailProvider } from "../../../../MailProvider/implementations/TitanMailProvider";

const pixProvider = new SicrediMockPixProvider()
const transactioRepository = new TransactionOrderPrismaRepository()
const userInfoRepository = new AppUserInfoPrismaRepository()
const userItemRepository = new AppUserItemPrismaRepository()
const mailProvider = new TitanMailProvider()
const createMockPixChargeController = new CreatePixChargeController(
    pixProvider,
    transactioRepository,
    userInfoRepository,
    userItemRepository,
    mailProvider
)

export { createMockPixChargeController }