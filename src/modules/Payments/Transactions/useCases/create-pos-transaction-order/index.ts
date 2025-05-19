import { CompanyDataPrismaRepository } from "../../../../Company/CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { PartnerConfigPrismaRepository } from "../../../../Company/PartnerConfig/repositories/implementations/prisma/partner-config-prisma.repository";
import { TransactionOrderPrismaRepository } from "../../repositories/implementations/transaction-order-prisma.repository";
import { CreatePOSTransactionOrderController } from "./create-pos-transaction-order.controller";

const businessInfoRepository = new CompanyDataPrismaRepository()
const transactionRepository = new TransactionOrderPrismaRepository()
const partnerConfigRepository = new PartnerConfigPrismaRepository()
const posTransactionController = new CreatePOSTransactionOrderController(
    businessInfoRepository,
    transactionRepository,
    partnerConfigRepository

)

export { posTransactionController}
