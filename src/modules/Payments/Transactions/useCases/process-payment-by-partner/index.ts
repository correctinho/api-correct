import { PartnerCreditPrismaRepository } from "../../../Accounts/repositories/implementations/partner-credit-prisma.repository";
import { BusinessAccountPrismaRepository } from "../../../Accounts/usecases/repositories/implementations/business-account-prisma.repository";
import { TransactionOrderPrismaRepository } from "../../repositories/implementations/transaction-order-prisma.repository";
import { ProcessPaymentByPartnerController } from "./process-payment-by-partner.controller";

const transactionRepository = new TransactionOrderPrismaRepository()
const businessAccountRepository = new BusinessAccountPrismaRepository()
const partnerCreditRepository = new PartnerCreditPrismaRepository()

const processPaymentByPartnerController = new ProcessPaymentByPartnerController(
    transactionRepository,
    businessAccountRepository,
    partnerCreditRepository
)

export { processPaymentByPartnerController }