import { SicrediMockPixProvider } from "../../../../../infra/providers/PixProvider/implementations/sicredi/MockPixProvider";
import { AppUserInfoPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { AppUserItemPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { TransactionOrderPrismaRepository } from "../../../Transactions/repositories/implementations/transaction-order-prisma.repository";
import { CreatePixChargeController } from "./create-pix-charge-by-app-user.controller";

const pixProvider = new SicrediMockPixProvider()
const transactioRepository = new TransactionOrderPrismaRepository()
const userInfoRepository = new AppUserInfoPrismaRepository()
const userItemRepository = new AppUserItemPrismaRepository()
const createMockPixChargeController = new CreatePixChargeController(
    pixProvider,
    transactioRepository,
    userInfoRepository,
    userItemRepository
)

export { createMockPixChargeController }