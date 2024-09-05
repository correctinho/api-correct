import { Router } from "express";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
import { createAppUserItemController } from "../../modules/AppUser/AppUserManagement/usecases/UserItem/create-user-item-by-employer";

export const appUserItemRouter = Router()

//*****EMPLOYER ENDPOINTS****** */

//create app user item by employer - NOT TESTED
appUserItemRouter.post("/user-item/employer", companyIsAuth, async (request, response) => {
  await createAppUserItemController.handle(request, response)
})
