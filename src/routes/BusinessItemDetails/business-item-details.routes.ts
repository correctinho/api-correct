import { Router } from "express";
import { correctIsAuth } from "../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware";
import { findEmployerItemDetails } from "../../modules/Company/BusinessItemsDetails/usecases/CorrectAdmin/findItemDetailsByCorrect";
import { findAllEmployerItemDetails } from "../../modules/Company/BusinessItemsDetails/usecases/CorrectAdmin/findAllByCorrect";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
import { createEmployerItemDetails } from "../../modules/Company/BusinessItemsDetails/usecases/CorrectAdmin/createEmployerItemByCorrect";
import { setEmployerCyclesController } from "../../modules/Company/BusinessItemsDetails/usecases/CorrectAdmin/updateEmployerCyclesByCorrect";
import { findAllEmployerItemDetailsBusinessAdmin } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessAdmin/findAllByBusinessAdmin";
import { findEmployerItemDetailsByBusiness } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessAdmin/findItemDetailsByBusinessAdmin";
import { listCollaboratorsByBenefitController } from "../../modules/AppUser/AppUserManagement/usecases/UserItem/list-collaborators-by-benefit";
import { listBusinessOrdersByBusinessController } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessItemsCreditRelease/list-business-orders/index-by-business";
import { listBusinessOrdersByCorrectAdminController } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessItemsCreditRelease/list-business-orders/index-by-correct-admin";
import { approveRechargeOrder } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessItemsCreditRelease/approve-recharge-order";

export const businessItemDetailsRouter = Router()

/*****CORRECT ENDPOINTS****** */

//create employer item details by correct admin - TESTED
businessItemDetailsRouter.post("/business/item/details/correct", correctIsAuth, async (request, response) => {
  await createEmployerItemDetails.handle(request, response)
})
//update employer item details by correct admin - TESTED
businessItemDetailsRouter.patch('/business/item/details/correct', correctIsAuth, async (request, response) => {
  await setEmployerCyclesController.handle(request, response)
})

//find single by correct - TESTED
businessItemDetailsRouter.get("/business/item/details/:id/correct/", correctIsAuth, async (request, response) => {
  await findEmployerItemDetails.handle(request, response)
})

//find all employer items by correct - TESTED
businessItemDetailsRouter.get("/business/item/details/correct/:business_info_uuid/", correctIsAuth, async (request, response) => {
  await findAllEmployerItemDetails.handle(request, response)
})

//List business orders by correct admin
// businessItemDetailsRouter.get(
//     "/business/orders/:businessInfoUuid/:item_uuid", 
//     correctIsAuth, 
//     async (request, response) => {
//         await listBusinessOrdersByCorrectAdminController.handle(request, response)
//     }
// )



/*****BUSINESS ENDPOINTS****** */

//find many by business admin - TESTED
businessItemDetailsRouter.get("/business/item/details", companyIsAuth, async (request, response) => {
  await findAllEmployerItemDetailsBusinessAdmin.handle(request, response)
})

//find single by business admin - TESTED
businessItemDetailsRouter.get("/business/item/details/:id/employer", companyIsAuth, async (request, response) => {
  await findEmployerItemDetailsByBusiness.handle(request, response)
})

// LISTAR COLABORADORES DO BENEFÍCIO (Para a aba "Colaboradores")
// GET /business/item/details/:id/collaborators?page=1&limit=10&status=inactive
businessItemDetailsRouter.get(
    "/business/item/details/:id/collaborators", 
    companyIsAuth, 
    async (request, response) => {
        await listCollaboratorsByBenefitController.handle(request, response)
    }
)
//List business orders by business admin
businessItemDetailsRouter.get(
    "/business/orders/list/:item_uuid", 
     companyIsAuth,
    async (request, response) => {
        await listBusinessOrdersByBusinessController.handle(request, response)
    }
)

//Approve recharge order endpoint
businessItemDetailsRouter.post(
    "/business/recharge-orders/approve", 
    correctIsAuth, 
    async (request, response) => {
        await approveRechargeOrder.handle(request, response)
    }
)