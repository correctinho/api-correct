import { TransactionOrderPrismaRepository } from "../../../../../Payments/Transactions/repositories/implementations/transaction-order-prisma.repository";
import { BusinessItemDetailsPrismaRepository } from "../../../repositories/implementations/business-item-details.prisma.repository";
import { GetPostpaidConsumptionController } from "./get-postpaid-consumption.controller";
import { GetPostpaidConsumptionUsecase } from "./get-postpaid-consumption.usecase";

const transactionOrderRepository = new TransactionOrderPrismaRepository();
const businessItemDetailsRepository = new BusinessItemDetailsPrismaRepository();

const getPostpaidConsumptionUsecase = new GetPostpaidConsumptionUsecase(transactionOrderRepository, businessItemDetailsRepository);
const getPostPaidConsumptionController = new GetPostpaidConsumptionController(transactionOrderRepository, businessItemDetailsRepository);

export { getPostPaidConsumptionController, getPostpaidConsumptionUsecase };
