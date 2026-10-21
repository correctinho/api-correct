import { TransactionOrderPrismaRepository } from "../../repositories/implementations/transaction-order-prisma.repository";
import { CancelSaleByAdminController } from "./cancel-sale-by-admin.controller";
import { CancelSaleByAdminUseCase } from "./cancel-sale-by-admin.usecase";

const transactionOrderRepository = new TransactionOrderPrismaRepository();

const cancelSaleByAdminUseCase = new CancelSaleByAdminUseCase(
  transactionOrderRepository
);

const cancelSaleByAdminController = new CancelSaleByAdminController(
  cancelSaleByAdminUseCase
);

export { cancelSaleByAdminUseCase, cancelSaleByAdminController };
