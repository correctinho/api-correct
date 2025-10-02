import { SicrediPixProvider } from "../../../../../infra/providers/PixProvider/implementations/sicredi/sicredi-pix.provider";
import { AppUserInfoPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { TransactionOrderPrismaRepository } from "../../../Transactions/repositories/implementations/transaction-order-prisma.repository";
import { CreatePixChargeController } from "./create-pix-charge-by-app-user.controller";

const pixProvider = new SicrediPixProvider()
const transactioRepository = new TransactionOrderPrismaRepository()
const userInfoRepository = new AppUserInfoPrismaRepository()

const createPixChargeController = new CreatePixChargeController(
    pixProvider,
    transactioRepository,
    userInfoRepository
)

export { createPixChargeController }