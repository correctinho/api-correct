import { AppUserInfoPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { AppUserItemPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { CompanyDataPrismaRepository } from "../../../../Company/CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { TransactionOrderPrismaRepository } from "../../repositories/implementations/transaction-order-prisma.repository";
import { GetTransactionReceiptController } from "./get-transaction-receipt.controller";

const transactionOrderRepository = new TransactionOrderPrismaRepository()
const businessInfo = new CompanyDataPrismaRepository()
const appUserInfo = new AppUserInfoPrismaRepository()
const appUserItem = new AppUserItemPrismaRepository()

const geTransactionReceiptController = new GetTransactionReceiptController(
  transactionOrderRepository,
  businessInfo,
  appUserItem,
  appUserInfo
)

export { geTransactionReceiptController}
