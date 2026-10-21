import { TransactionOrderPrismaRepository } from "../../repositories/implementations/transaction-order-prisma.repository";
import { GetPartnerSalesController } from "./get-partner-sales.controller";
import { GetPartnerSalesUseCase } from "./get-partner-sales.usecase";

const transactionOrderPrismaRepository = new TransactionOrderPrismaRepository();
const getPartnerSalesController = new GetPartnerSalesController(transactionOrderPrismaRepository);

export { getPartnerSalesController };
