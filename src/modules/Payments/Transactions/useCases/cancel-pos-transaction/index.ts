import { TransactionOrderPrismaRepository } from "../../repositories/implementations/transaction-order-prisma.repository";
import { CancelPOSTransactionController } from "./cancel-pos-transaction.controller";
import { CancelPOSTransactionUsecase } from "./cancel-pos-transaction.usecase";

// 1. Instanciar o repositório (Singleton geralmente, ou nova instância se preferir)
const transactionOrderRepository = new TransactionOrderPrismaRepository();

// 2. Instanciar o Use Case injetando o repositório
const cancelPOSTransactionUsecase = new CancelPOSTransactionUsecase(transactionOrderRepository);

// 3. Instanciar o Controller injetando o Use Case
const cancelPOSTransactionController = new CancelPOSTransactionController(cancelPOSTransactionUsecase);

// 4. Exportar o controller pronto para uso nas rotas
export { cancelPOSTransactionController };