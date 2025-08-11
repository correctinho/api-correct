import { TransactionOrderPrismaRepository } from "../../../../Transactions/repositories/implementations/transaction-order-prisma.repository";
import { PartnerCreditPrismaRepository } from "../../../repositories/implementations/partner-credit-prisma.repository";
import { GetBusinessCreditsController } from "./get-business-credits.controller";

const partnerCreditRepository = new PartnerCreditPrismaRepository();
const transactionOrderRepository = new TransactionOrderPrismaRepository();

const getBusinessCreditController = new GetBusinessCreditsController(
    partnerCreditRepository, 
    transactionOrderRepository)

export { getBusinessCreditController };