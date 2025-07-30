import { AppUserInfoPrismaRepository } from "../../../../../AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository"
import { AppUserItemPrismaRepository } from "../../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository"
import { CompanyDataPrismaRepository } from "../../../../../Company/CompanyData/repositories/implementations/prisma/company-data-prisma.repository"
import { TransactionOrderPrismaRepository } from "../../../repositories/implementations/transaction-order-prisma.repository"
import { GenerateReceiptPdfController } from "./generate-receipt-pdf.controller"

const transactionOrderRepository = new TransactionOrderPrismaRepository()
const businessInfo = new CompanyDataPrismaRepository()
const appUserInfo = new AppUserInfoPrismaRepository()
const appUserItem = new AppUserItemPrismaRepository()

const generateReceiptPDFController = new GenerateReceiptPdfController(
  transactionOrderRepository,
  businessInfo,
  appUserItem,
  appUserInfo
)

export { generateReceiptPDFController}