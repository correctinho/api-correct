import { AppUserItemPrismaRepository } from "../../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { TransactionOrderPrismaRepository } from "../../../repositories/implementations/transaction-order-prisma.repository";
import { ExecuteTeiTransferUsecase } from "./execute-tei-transfer.usecase";

const userItemRepository = new AppUserItemPrismaRepository()
const transactionRepository = new TransactionOrderPrismaRepository();

const executeTeiTransferUsecase = new ExecuteTeiTransferUsecase(
    userItemRepository,
    transactionRepository
);

export { executeTeiTransferUsecase}