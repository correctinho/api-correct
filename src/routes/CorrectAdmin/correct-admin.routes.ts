import { Router } from "express";
import { createCorrectAdminController } from "../../modules/CorrectAdmin/useCases/create-correct-admin";
import { authAdminController } from "../../modules/CorrectAdmin/useCases/authenticate-admin";
import { correctIsAuth } from "../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware";
import { findCorrectAdminController } from "../../modules/CorrectAdmin/useCases/find-correct-admin";
import { createCorrectSellerController } from "../../modules/CorrectAdmin/useCases/create-correct-seller-by-admin";
import { getCorrectAdminAccount } from "../../modules/Payments/Accounts/usecases/correctAdmin/get-correct-admin-account";
import { listPartnerController, listEmployerController, getEmployerDetailsController, getBusinessDetailController, approveBusinessController, resendAccessController } from "../../modules/business/presentation/controllers";

import { ListTransactionsPrismaRepository } from "../../modules/Payments/Transactions/infra/databases/prisma/repositories/list-transactions.prisma.repository";
import { ListTransactionsUsecase } from "../../modules/Payments/Transactions/application/usecases/list-transactions.usecase";
import { ListTransactionsController } from "../../modules/Payments/Transactions/presentation/controllers/list-transactions.controller";

import { InvoicesPrismaRepository } from "../../modules/Invoices/infra/databases/prisma/repositories/invoices.prisma.repository";
import { ListInvoicesUsecase } from "../../modules/Invoices/application/usecases/list-invoices.usecase";
import { PayInvoiceUsecase } from "../../modules/Invoices/application/usecases/pay-invoice.usecase";
import { ListInvoicesController } from "../../modules/Invoices/presentation/controllers/list-invoices.controller";
import { PayInvoiceController } from "../../modules/Invoices/presentation/controllers/pay-invoice.controller";
import { updatePartnerTaxesController } from "../../modules/Company/PartnerConfig/usecases/update-partner-taxes";
import { getDashboardStatsController } from "../../modules/Dashboard/usecases/get-dashboard-stats";

const correctAdminRouter = Router()

const listTransactionsRepository = new ListTransactionsPrismaRepository();
const listTransactionsUsecase = new ListTransactionsUsecase(listTransactionsRepository);
const listTransactionsController = new ListTransactionsController(listTransactionsUsecase);

const invoicesRepository = new InvoicesPrismaRepository();
const listInvoicesUsecase = new ListInvoicesUsecase(invoicesRepository);
const payInvoiceUsecase = new PayInvoiceUsecase(invoicesRepository);
const listInvoicesController = new ListInvoicesController(listInvoicesUsecase);
const payInvoiceController = new PayInvoiceController(payInvoiceUsecase);

import { generateEmployerInvoicesJob } from "../../modules/CronJobs/Invoices/GenerateInvoicesJob";

correctAdminRouter.get('/admin/debug/execute-billing-job', async (request, response) => {
  await generateEmployerInvoicesJob.execute();
  return response.status(200).send({ message: "Job executado com sucesso" });
});

correctAdminRouter.post('/admin', async (request, response) => {
  await createCorrectAdminController.handle(request, response)
})

//create correct seller by admin
correctAdminRouter.post('/seller', correctIsAuth, async (request, response) => {
  await createCorrectSellerController.handle(request, response)
})

correctAdminRouter.post('/login', async (request, response) => {
  await authAdminController.handle(request, response)
})

correctAdminRouter.get("/admin/profile", correctIsAuth, async (request, response) => {
  await findCorrectAdminController.handle(request, response)
})

//correct admin accounts
correctAdminRouter.get("/admin/account", correctIsAuth, async (request, response) => {
  await getCorrectAdminAccount.handle(request, response)
})

// list partners
correctAdminRouter.get("/admin/partners", correctIsAuth, async (request, response) => {
  await listPartnerController.handle(request, response)
})

// list employers
correctAdminRouter.get("/admin/employers", correctIsAuth, async (request, response) => {
  await listEmployerController.handle(request, response)
})

// get employer details
correctAdminRouter.get("/admin/employers/:id", correctIsAuth, async (request, response) => {
  await getEmployerDetailsController.handle(request, response)
})

// get business detail
correctAdminRouter.get("/admin/business/:uuid", correctIsAuth, async (request, response) => {
  await getBusinessDetailController.handle(request, response)
})

// list transactions
correctAdminRouter.get("/admin/transactions", correctIsAuth, async (request, response) => {
  await listTransactionsController.handle(request, response)
})

// approve business
correctAdminRouter.patch("/admin/business/:uuid/approve", correctIsAuth, async (request, response) => {
  await approveBusinessController.handle(request, response)
})

// resend access
correctAdminRouter.patch("/admin/business/:uuid/resend-access", correctIsAuth, async (request, response) => {
  await resendAccessController.handle(request, response)
})

// list invoices
correctAdminRouter.get("/admin/invoices", correctIsAuth, async (req, res) => {
  await listInvoicesController.handle(req, res)
})

// pay invoice
correctAdminRouter.patch("/admin/invoices/:uuid/pay", correctIsAuth, async (req, res) => {
  await payInvoiceController.handle(req, res)
})

// update partner fees
correctAdminRouter.patch("/admin/partners/:uuid/fees", correctIsAuth, async (request, response) => {
  await updatePartnerTaxesController.handle(request, response)
})

// dashboard stats
correctAdminRouter.get("/admin/dashboard/stats", correctIsAuth, async (request, response) => {
  await getDashboardStatsController.handle(request, response)
})

export { correctAdminRouter }
