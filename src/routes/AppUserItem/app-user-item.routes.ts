import { Router } from "express";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
import { createAppUserItemController } from "../../modules/AppUser/AppUserManagement/usecases/UserItem/create-user-item-by-employer";
import { findUserItemById } from "../../modules/AppUser/AppUserManagement/usecases/UserItem/find-user-item-by-id";
import { findAllUserItemsByemployer } from "../../modules/AppUser/AppUserManagement/usecases/UserItem/find-all-by-employer";

export const appUserItemRouter = Router()

//*****EMPLOYER ENDPOINTS****** */

//create app user item by employer - TESTED
appUserItemRouter.post("/user-item/employer", companyIsAuth, async (request, response) => {
  await createAppUserItemController.handle(request, response)
})

//find user item by id employer - TESTED
appUserItemRouter.get("/user-item/employer", companyIsAuth, async (request, response) => {
  await findUserItemById.handle(request, response)
})

//find all user items by employer - NOT TESTED
appUserItemRouter.get("/user-item/all/employer", companyIsAuth, async (request, response) => {
  await findAllUserItemsByemployer.handle(request, response)
})
