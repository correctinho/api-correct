import { request, Router } from "express";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
// import { createAppUserItemController } from "../../modules/AppUser/AppUserManagement/usecases/UserItem/create-user-item-by-employer";
import { findUserItemById } from "../../modules/AppUser/AppUserManagement/usecases/UserItem/find-user-item-by-id";
import { findAllUserItemsByemployer } from "../../modules/AppUser/AppUserManagement/usecases/UserItem/find-all-by-employer";
import { blockOrCancelUserItemByEmployer } from "../../modules/AppUser/AppUserManagement/usecases/UserItem/block-or-cancel-user-item-by-employer";
import { appUserIsAuth } from "../../infra/shared/middlewares/AppUser/app-user-auth.middleware";
import { findAllUserItemsByUser } from "../../modules/AppUser/AppUserManagement/usecases/UserItem/find-user-items-by-app-user";
import { activateUserItemByEmployer } from "../../modules/AppUser/AppUserManagement/usecases/UserItem/activate-user-item-by-employer";
import { getAppUserItemHistoryController } from "../../modules/Payments/Accounts/usecases/account-histories/app-user";
import { activateUserItemsBatchController } from "../../modules/AppUser/AppUserManagement/usecases/UserItem/activate-user-items-batch";
import { previewRechargeOrderController } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessItemsCreditRelease/preview-recharge-order";
import { createRechargeOrderController } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessItemsCreditRelease/create-recharge-order";

export const appUserItemRouter = Router()

//*****EMPLOYER ENDPOINTS****** */

//create app user item by employer - TESTED
// appUserItemRouter.post("/user-item/employer", companyIsAuth, async (request, response) => {
//   await createAppUserItemController.handle(request, response)
// })

//find user item by id employer - TESTED
appUserItemRouter.get("/user-item/employer", companyIsAuth, async (request, response) => {
  await findUserItemById.handle(request, response)
})

//find all user items by employer - TESTED
appUserItemRouter.get("/user-item/all/employer", companyIsAuth, async (request, response) => {
  await findAllUserItemsByemployer.handle(request, response)
})

//activate uer items by employer
appUserItemRouter.patch("/user-item/activate", companyIsAuth, async (request, response) => {
  await activateUserItemByEmployer.handle(request, response)
})

//ativate user items batch by employer
appUserItemRouter.patch("/user-item/activate/batch", companyIsAuth, async (request, response) => {
  await activateUserItemsBatchController.handle(request, response)
})

//block or cancel user item by employer - TESTED
appUserItemRouter.patch("/user-item/employer", companyIsAuth, async (request, response) => {
  await blockOrCancelUserItemByEmployer.handle(request, response)
})

//preview recharge order
appUserItemRouter.get("/user-item/employer/preview-recharge/:item_uuid", companyIsAuth, async (request, response) => {
  await previewRechargeOrderController.handle(request, response)
})

//create recharge order 
appUserItemRouter.post("/user-item/employer/recharge-order", companyIsAuth, async (request, response) => {
  await createRechargeOrderController.handle(request, response)
})

//Busca usuários com itens específicos --- IGNORE ---
// appUserItemRouter.post("/business/item/details/:id/collaborators", companyIsAuth, async (request, response) => {
//   await findUsersWithSpecificItemsByEmployerController.handle(request, response)
// })

//*****APP USER ENDPOINTS****** */

//find user item by user - TESTED
appUserItemRouter.get("/user-item", appUserIsAuth, async (request, response) => {
  await findUserItemById.handle(request, response)
})


//find all user items by user - NOT TESTED
appUserItemRouter.get("/user-item/all", appUserIsAuth, async (request, response) => {
  await findAllUserItemsByUser.handle(request, response)
})


/*APP USER ACCOUNTS */
//get app user item history by app user
appUserItemRouter.get("/app-user/account/history", appUserIsAuth, async (request, response) => {
  await getAppUserItemHistoryController.handle(request, response)
})
