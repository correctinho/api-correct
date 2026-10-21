import { TransactionOrderPrismaRepository } from "../../repositories/implementations/transaction-order-prisma.repository";
import { GetPOSTransactionStatusController } from "./get-pos-transaction-status.controller";
import { GetPOSTransactionStatusUseCase } from "./get-pos-transaction-status.usecase";

const transactionOrderRepository = new TransactionOrderPrismaRepository();
const getPOSTransactionStatusUseCase = new GetPOSTransactionStatusUseCase(transactionOrderRepository);
const getPOSTransactionStatusController = new GetPOSTransactionStatusController(getPOSTransactionStatusUseCase);

export { getPOSTransactionStatusController, getPOSTransactionStatusUseCase };
