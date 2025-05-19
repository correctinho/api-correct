import { AccountsHistoryPrismaRepository } from "../../../repositories/implementations/accounts-history-prisma.repository";
import { GetAppUserHistoryByAccountIdController } from "./get-history-by-useritem-id.controller";

const accountyHistoryRepository = new AccountsHistoryPrismaRepository()
const getAppUserItemHistoryController = new GetAppUserHistoryByAccountIdController(accountyHistoryRepository)

export { getAppUserItemHistoryController }
