import { AccountsHistoryPrismaRepository } from "../../../repositories/implementations/accounts-history-prisma.repository";
import { BusinessAccountPrismaRepository } from "../../../repositories/implementations/business-account-prisma.repository";
import { GetBusinessAccountHistoryController } from "./get-business-account-history.controller";

const accountHistoruRepository = new AccountsHistoryPrismaRepository()
const businessAccountRepository = new BusinessAccountPrismaRepository()

const getBusinessAccountHistoryController = new GetBusinessAccountHistoryController(
  accountHistoruRepository,
  businessAccountRepository
)

export { getBusinessAccountHistoryController }
