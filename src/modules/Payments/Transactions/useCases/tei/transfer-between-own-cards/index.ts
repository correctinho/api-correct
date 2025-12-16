import { AppUserItemPrismaRepository } from "../../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { TransactionOrderPrismaRepository } from "../../../repositories/implementations/transaction-order-prisma.repository";
import { TransferBetweenOwnCardsController } from "./transfer-between-own-cards.controller";

const userItemRepository = new AppUserItemPrismaRepository()
const transactionRepository = new TransactionOrderPrismaRepository()

const transferBetweenOwnCardsController = new TransferBetweenOwnCardsController(
    userItemRepository,
    transactionRepository
)

export { transferBetweenOwnCardsController }