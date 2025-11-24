import { OfflineTokensHistoryPrismaRepository } from "../../repositories/implementations/offline-tokens-history.prisma.repository";
import { OfflineTokensPrismaRepository } from "../../repositories/implementations/offline-tokens.prisma.repository";
import { GetTokensOfflineController } from "./get-tokens-offline.controller";

const offlineTokenRepository = new OfflineTokensPrismaRepository()
const offlineTokenHistoryRepository = new OfflineTokensHistoryPrismaRepository()

const getTokensOffline = new GetTokensOfflineController(
    offlineTokenRepository,
    offlineTokenHistoryRepository
)

export { getTokensOffline}