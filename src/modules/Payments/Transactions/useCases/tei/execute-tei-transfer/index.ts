import { AppUserItemPrismaRepository } from "../../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { TransactionOrderPrismaRepository } from "../../../repositories/implementations/transaction-order-prisma.repository";
import { ExecuteTeiTransferController } from "./execute-tei-transfer.controller";

const userItemRepository = new AppUserItemPrismaRepository()
const transactionRepository = new TransactionOrderPrismaRepository();

const executeTeiTransfer = new ExecuteTeiTransferController(
    userItemRepository,
    transactionRepository
);

export { executeTeiTransfer}