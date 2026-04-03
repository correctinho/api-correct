import { Router } from "express";
import { createCorrectAdminController } from "../../modules/CorrectAdmin/useCases/create-correct-admin";
import { authAdminController } from "../../modules/CorrectAdmin/useCases/authenticate-admin";
import { correctIsAuth } from "../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware";
import { findCorrectAdminController } from "../../modules/CorrectAdmin/useCases/find-correct-admin";
import { createCorrectSellerController } from "../../modules/CorrectAdmin/useCases/create-correct-seller-by-admin";
import { getCorrectAdminAccount } from "../../modules/Payments/Accounts/usecases/correctAdmin/get-correct-admin-account";
import { listPartnerController, getBusinessDetailController, approveBusinessController, resendAccessController } from "../../modules/business/presentation/controllers";

const correctAdminRouter = Router()

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

// get business detail
correctAdminRouter.get("/admin/business/:uuid", correctIsAuth, async (request, response) => {
  await getBusinessDetailController.handle(request, response)
})

// approve business
correctAdminRouter.patch("/admin/business/:uuid/approve", correctIsAuth, async (request, response) => {
  await approveBusinessController.handle(request, response)
})

// resend access
correctAdminRouter.patch("/admin/business/:uuid/resend-access", correctIsAuth, async (request, response) => {
  await resendAccessController.handle(request, response)
})

export { correctAdminRouter }
