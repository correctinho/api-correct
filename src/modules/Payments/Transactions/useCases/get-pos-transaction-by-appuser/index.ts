import { AppUserItemPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { CompanyDataPrismaRepository } from "../../../../Company/CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { PartnerConfigPrismaRepository } from "../../../../Company/PartnerConfig/repositories/implementations/prisma/partner-config-prisma.repository";
import { TransactionOrderPrismaRepository } from "../../repositories/implementations/transaction-order-prisma.repository";
import { GetPOSTransactionByAppUserController } from "./get-pos-transaction-by-appuser.controller";

const transactionOrderRepository = new TransactionOrderPrismaRepository()
const userItemRepository = new AppUserItemPrismaRepository()
const partnerConfigRepository = new PartnerConfigPrismaRepository()
const businessInfoRepository = new CompanyDataPrismaRepository()

const getPOSTransactionByAppUserController = new GetPOSTransactionByAppUserController(
  transactionOrderRepository,
  userItemRepository,
  partnerConfigRepository,
  businessInfoRepository
)

export { getPOSTransactionByAppUserController}
