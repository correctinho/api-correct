import { TransactionOrderPrismaRepository } from "../../repositories/implementations/transaction-order-prisma.repository";
import { CancelPartnerSaleController } from "./cancel-partner-sale.controller";
import { CancelPartnerSaleUseCase } from "./cancel-partner-sale.usecase";

const transactionOrderRepository = new TransactionOrderPrismaRepository();

const cancelPartnerSaleUseCase = new CancelPartnerSaleUseCase(
  transactionOrderRepository
);

const cancelPartnerSaleController = new CancelPartnerSaleController(
  cancelPartnerSaleUseCase
);

export { cancelPartnerSaleUseCase, cancelPartnerSaleController };
