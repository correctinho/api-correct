import { AppUserItemPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { CompanyDataPrismaRepository } from "../../../../Company/CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { PartnerConfigPrismaRepository } from "../../../../Company/PartnerConfig/repositories/implementations/prisma/partner-config-prisma.repository";
import { OfflineTokensPrismaRepository } from "../../../OfflineTokens/repositories/implementations/offline-tokens.prisma.repository";
import { TransactionOrderPrismaRepository } from "../../repositories/implementations/transaction-order-prisma.repository";
import { ProcessPOSTransactionWithOfflineTokenController } from "./process-pos-payment-by-offline-token.controller";

const busienssRepository = new CompanyDataPrismaRepository()
const transactionRepository = new TransactionOrderPrismaRepository()
const userItemRepository = new AppUserItemPrismaRepository()
const partnerConfigRepository = new PartnerConfigPrismaRepository()
const offlineTokenRepository = new OfflineTokensPrismaRepository()

const processOfflineTokenController = new ProcessPOSTransactionWithOfflineTokenController(
 busienssRepository,
 transactionRepository,
 userItemRepository,
 partnerConfigRepository,
 offlineTokenRepository   
)

export { processOfflineTokenController }