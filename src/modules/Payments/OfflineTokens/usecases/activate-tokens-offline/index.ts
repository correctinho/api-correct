import { AppUserItemPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { OfflineTokensHistoryPrismaRepository } from "../../repositories/implementations/offline-tokens-history.prisma.repository";
import { OfflineTokensPrismaRepository } from "../../repositories/implementations/offline-tokens.prisma.repository";
import { ActivateTokensOfflineController } from "./activate-tokens-offline.controller";

const appUserItemRepository = new AppUserItemPrismaRepository()
const offlineTokenRepository = new OfflineTokensPrismaRepository()
const offlineTokenHistoryRepository = new OfflineTokensHistoryPrismaRepository()

const activateTokenController = new ActivateTokensOfflineController(
    appUserItemRepository,
    offlineTokenRepository,
    offlineTokenHistoryRepository
)

export { activateTokenController }