import { TitanMailProvider } from "../../../../../infra/providers/MailProvider/implementations/TitanMailProvider";
import { AppUserItemPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { CompanyDataPrismaRepository } from "../../../../Company/CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { SubscriptionPrismaRepository } from "../../../SubscriptionsPlans/repositories/implementations/subscription.prisma.repository";
import { TransactionOrderPrismaRepository } from "../../../Transactions/repositories/implementations/transaction-order-prisma.repository";
import { ProcessPixWebhookController } from "./process-pix-webhook.controller";

const transactionRepository = new TransactionOrderPrismaRepository()
const subscriptionRepository = new SubscriptionPrismaRepository()
const userItemRepository = new AppUserItemPrismaRepository()
const businessInfo = new CompanyDataPrismaRepository()
const titanEmailProvider = new TitanMailProvider

const processPixWebhook = new ProcessPixWebhookController(
    transactionRepository,
    subscriptionRepository,
    userItemRepository,
    businessInfo,
    titanEmailProvider
)

export { processPixWebhook }