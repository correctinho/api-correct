import { TransactionOrderPrismaRepository } from "../../Payments/Transactions/repositories/implementations/transaction-order-prisma.repository";
import { CancelAbandonedPOSTransactionsJob } from "./CancelAbandonedPOSTransactionsJob";

const transactionOrderRepository = new TransactionOrderPrismaRepository();

const cancelAbandonedPOSTransactionsJob = new CancelAbandonedPOSTransactionsJob(
  transactionOrderRepository
);

export { cancelAbandonedPOSTransactionsJob };
