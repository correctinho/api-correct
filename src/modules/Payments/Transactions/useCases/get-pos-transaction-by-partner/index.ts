import { CompanyDataPrismaRepository } from "../../../../Company/CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { TransactionOrderPrismaRepository } from "../../repositories/implementations/transaction-order-prisma.repository";
import { GetPOSTransactionByPartnerController } from "./get-pos-transaction-by-partner.controller";
import { GetPOSTransactionByPartnerUsecase } from "./get-pos-transaction-by-partner.usecase";

const transactionOrderRepository = new TransactionOrderPrismaRepository();
const businessInfoRepository = new CompanyDataPrismaRepository();

const getPOSTransactionByPartnerUsecase = new GetPOSTransactionByPartnerUsecase(
  transactionOrderRepository,
  businessInfoRepository
);

const getPOSTransactionByPartnerController = new GetPOSTransactionByPartnerController(
  getPOSTransactionByPartnerUsecase
);

export { getPOSTransactionByPartnerController };
