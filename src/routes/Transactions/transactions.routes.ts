import { Router } from "express";
import { posTransactionController } from "../../modules/Payments/Transactions/useCases/create-pos-transaction-order";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";

const transactionsRouter = Router()

// Create POS transaction order by partner
transactionsRouter.post("/pos-transaction", companyIsAuth, async (request, response) => {
  await posTransactionController.handle(request, response)
})

export { transactionsRouter }
