import { Router } from "express";
import { posTransactionController } from "../../modules/Payments/Transactions/useCases/create-pos-transaction-order";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
import { appUserIsAuth } from "../../infra/shared/middlewares/AppUser/app-user-auth.middleware";
import { getPOSTransactionByAppUserController } from "../../modules/Payments/Transactions/useCases/get-pos-transaction-by-appuser";

const transactionsRouter = Router()

// Create POS transaction order by partner - TESTED
transactionsRouter.post("/pos-transaction", companyIsAuth, async (request, response) => {
  await posTransactionController.handle(request, response)
})

// Get POS transaction by app user
transactionsRouter.get("/pos-transaction/app-user", appUserIsAuth, async (request, response) => {
  await getPOSTransactionByAppUserController.handle(request, response)
})

export { transactionsRouter }
