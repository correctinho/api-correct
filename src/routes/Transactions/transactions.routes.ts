import { request, Router } from "express";
import { posTransactionController } from "../../modules/Payments/Transactions/useCases/create-pos-transaction-order";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
import { appUserIsAuth } from "../../infra/shared/middlewares/AppUser/app-user-auth.middleware";
import { processPaymentByAppUserController } from "../../modules/Payments/Transactions/useCases/process-payment-by-app-user";
import { getPOSTransactionByAppUserController } from "../../modules/Payments/Transactions/useCases/get-pos-transaction-by-appuser";
import { geTransactionReceiptController } from "../../modules/Payments/Transactions/useCases/get-transaction-receipt";
import { generateReceiptPDFController } from "../../modules/Payments/Transactions/useCases/get-transaction-receipt/generate-receipt-pdf";
import { processPaymentByPartnerController } from "../../modules/Payments/Transactions/useCases/process-payment-by-partner";
import { sseSubscribe } from "../../infra/sse/sse.config";

const transactionsRouter = Router()

// Create POS transaction order by partner - TESTED
transactionsRouter.post("/pos-transaction", companyIsAuth, async (request, response) => {
  await posTransactionController.handle(request, response)
})

// Get POS transaction by app user
transactionsRouter.get("/pos-transaction/app-user", appUserIsAuth, async (request, response) => {
  await getPOSTransactionByAppUserController.handle(request, response)
})

//Process payment by app user with pre paid benefit
transactionsRouter.post("/pos-transaction/processing", appUserIsAuth, async (request, response) => {
  await processPaymentByAppUserController.handle(request, response)
})

//Process payment by partner with business account
transactionsRouter.post("/pos-transaction/business/processing", companyIsAuth, async (request, response) => {
  await processPaymentByPartnerController.handle(request, response)
})

//Generate transaction details for receipt
transactionsRouter.get("/transaction/receipt", async (request, response) => {
  await geTransactionReceiptController.handle(request, response)
})

//generate receipt pdf
transactionsRouter.get("/transaction/:transactionId/download", async (request, response) => {
  await generateReceiptPDFController.handle(request, response)
})

// Endpoint para o PDV se inscrever e ouvir atualizações de uma transação via SSE
transactionsRouter.get("/transactions/:transactionId/subscribe", sseSubscribe);

export { transactionsRouter }
