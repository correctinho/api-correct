import { Router } from "express";
import { posTransactionController } from "../../modules/Payments/Transactions/useCases/create-pos-transaction-order";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
import { appUserIsAuth } from "../../infra/shared/middlewares/AppUser/app-user-auth.middleware";
import { getPOSTransactionByAppUserController } from "../../modules/Payments/Transactions/useCases/get-pos-transaction-by-appuser";
import { processPaymentByAppUserController } from "../../modules/Payments/Transactions/useCases/process-payment-by-app-user";

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
  await  processPaymentByAppUserController.handle(request, response)
})

export { transactionsRouter }
