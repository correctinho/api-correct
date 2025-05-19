import { AppUserItemPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { PartnerConfigPrismaRepository } from "../../../../Company/PartnerConfig/repositories/implementations/prisma/partner-config-prisma.repository";
import { TransactionOrderPrismaRepository } from "../../repositories/implementations/transaction-order-prisma.repository";
import { ProcessPaymentByAppUserController } from "./process-payment-by-app-user.controller";

const transactionOrderRepository = new TransactionOrderPrismaRepository()
const userItemRepository = new AppUserItemPrismaRepository()
const partnerConfigRepository = new PartnerConfigPrismaRepository()

const processPaymentByAppUserController = new ProcessPaymentByAppUserController(
  transactionOrderRepository,
  userItemRepository,
  partnerConfigRepository,
)

export { processPaymentByAppUserController }
