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
import { createPixChargeController } from "../../modules/Payments/Pix/usecases/create-pix-charge-by-app-user";
import { processPixWebhook } from "../../modules/Payments/Pix/usecases/process-pix-webhook";
import { createMockPixChargeController } from "../../infra/providers/PixProvider/implementations/sicredi/tests/index.mock";
import { activateTokenController } from "../../modules/Payments/OfflineTokens/usecases/activate-tokens-offline";
import { processOfflineTokenController } from "../../modules/Payments/Transactions/useCases/process-pos-payment-by-offline-token";
import { getTokensOffline } from "../../modules/Payments/OfflineTokens/usecases/get-tokens-offline";
import { cancelPOSTransactionController } from "../../modules/Payments/Transactions/useCases/cancel-pos-transaction";
import { getRecipientController } from "../../modules/Payments/Transactions/useCases/tei/get-recipient-by-cpf";
import { executeTeiTransfer } from "../../modules/Payments/Transactions/useCases/tei/execute-tei-transfer";
import { transferBetweenOwnCardsController } from "../../modules/Payments/Transactions/useCases/tei/transfer-between-own-cards";

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

// Create Pix Charge By AppUser
transactionsRouter.post('/transaction/pix/charge/app-user', appUserIsAuth, async (request, response) => {
  await createPixChargeController.handle(request, response)
})

// Create Pix Charge By AppUser - Mocked - For E2E Testes
transactionsRouter.post('/transaction/pix/charge/app-user/mocked', appUserIsAuth, async (request, response) => {
  await createMockPixChargeController.handle(request, response)
})
transactionsRouter.post(
    "/webhooks/sicredi-pix",
    async (req, res) => await processPixWebhook.handle(req, res)
);

//Activate Offline Token
transactionsRouter.post("/app-user/activate-token", appUserIsAuth, async (request, response) => {
  await activateTokenController.handle(request, response)
})

//Get Offiline Tokens
transactionsRouter.get("/app-user/offline-tokens", appUserIsAuth, async (request, response) => {
  await getTokensOffline.handle(request, response)
})
//Process POS Offline Token transaction
transactionsRouter.post("/app-user/transation/offline-token", companyIsAuth, async (request, response) => {
  await processOfflineTokenController.handle(request, response)
})

// Cancel POS Transaction
transactionsRouter.patch(
  '/transactions/:transaction_uuid/cancel',
  companyIsAuth,
  (request, response) => {
    return cancelPOSTransactionController.handle(request, response);
  }
);

//Get recipient data by CPF for TEI transactions
transactionsRouter.get('/tei/recipient/:cpf', appUserIsAuth, async (request, response) => {
  await getRecipientController.handle(request, response);
});

//Execute TEI Transfer
transactionsRouter.post('/tei/transfer', appUserIsAuth, async (request, response) => {
  await executeTeiTransfer.handle(request, response);
});

//Execute TEI Internal Transfer
transactionsRouter.post('/tei/transfer/internal', appUserIsAuth, async (request, response) => {
  await transferBetweenOwnCardsController.handle(request, response);
});

export { transactionsRouter }
