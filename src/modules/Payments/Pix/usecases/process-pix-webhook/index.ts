import { AppUserItemPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { TransactionOrderPrismaRepository } from "../../../Transactions/repositories/implementations/transaction-order-prisma.repository";
import { ProcessPixWebhookController } from "./process-pix-webhook.controller";

const transactionRepository = new TransactionOrderPrismaRepository()

const processPixWebhook = new ProcessPixWebhookController(
    transactionRepository,
)

export { processPixWebhook }