import { TransactionOrderPrismaRepository } from "../../../../../Payments/Transactions/repositories/implementations/transaction-order-prisma.repository";
import { BusinessItemDetailsPrismaRepository } from "../../../repositories/implementations/business-item-details.prisma.repository";
import { GetPostpaidConsumptionController } from "./get-postpaid-consumption.controller";

const transactionOrderRepository = new TransactionOrderPrismaRepository();
const businessItemDetailsRepository = new BusinessItemDetailsPrismaRepository();

const getPostPaidConsumptionController = new GetPostpaidConsumptionController(transactionOrderRepository, businessItemDetailsRepository);

export { getPostPaidConsumptionController };
