import { TitanMailProvider } from "../../../../../infra/providers/MailProvider/implementations/TitanMailProvider";
import { AppUserItemPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { CompanyDataPrismaRepository } from "../../../../Company/CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { SubscriptionPrismaRepository } from "../../../SubscriptionsPlans/repositories/implementations/subscription.prisma.repository";
import { TransactionOrderPrismaRepository } from "../../../Transactions/repositories/implementations/transaction-order-prisma.repository";
import { BusinessOrderPrismaRepository } from "../../../../Company/BusinessItemsDetails/repositories/implementations/business-order-prisma.repository";
import { ProcessPixWebhookController } from "./process-pix-webhook.controller";

const transactionRepository = new TransactionOrderPrismaRepository()
const subscriptionRepository = new SubscriptionPrismaRepository()
const userItemRepository = new AppUserItemPrismaRepository()
const businessInfo = new CompanyDataPrismaRepository()
const titanEmailProvider = new TitanMailProvider()
const businessOrderRepository = new BusinessOrderPrismaRepository()

console.log('--- INDEX TS LOG ---');
console.log('BusinessOrderPrismaRepository type:', typeof BusinessOrderPrismaRepository);
console.log('BusinessOrderPrismaRepository is class?', typeof BusinessOrderPrismaRepository === 'function');
console.log('businessOrderRepository type:', typeof businessOrderRepository, 'Constructor:', businessOrderRepository?.constructor?.name);
console.log('Is instance?', businessOrderRepository instanceof BusinessOrderPrismaRepository);
console.log('Transaction Repo Constructor:', transactionRepository?.constructor?.name);
console.log('Subscription Repo Constructor:', subscriptionRepository?.constructor?.name);
console.log('Business Info Constructor:', businessInfo?.constructor?.name);

const processPixWebhook = new ProcessPixWebhookController(
    transactionRepository,
    subscriptionRepository,
    userItemRepository,
    businessInfo,
    titanEmailProvider,
    businessOrderRepository
)

export { processPixWebhook }
