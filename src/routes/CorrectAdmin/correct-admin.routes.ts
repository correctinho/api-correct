import { Router } from "express";
import { createCorrectAdminController } from "../../modules/CorrectAdmin/useCases/create-correct-admin";
import { authAdminController } from "../../modules/CorrectAdmin/useCases/authenticate-admin";
import { correctIsAuth } from "../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware";
import { findCorrectAdminController } from "../../modules/CorrectAdmin/useCases/find-correct-admin";
import { createCorrectSellerController } from "../../modules/CorrectAdmin/useCases/create-correct-seller-by-admin";

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

export { correctAdminRouter }
