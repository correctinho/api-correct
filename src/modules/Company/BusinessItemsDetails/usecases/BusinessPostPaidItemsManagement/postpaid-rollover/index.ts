import { TransactionOrderPrismaRepository } from "../../../../../Payments/Transactions/repositories/implementations/transaction-order-prisma.repository";
import { PostpaidRolloverController } from "./postpaid-rollover.controller";

const transactionOrderRepository = new TransactionOrderPrismaRepository();

const postpaidRolloverController = new PostpaidRolloverController(transactionOrderRepository);

export { postpaidRolloverController };
