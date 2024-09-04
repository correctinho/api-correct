import { Router } from "express";
import { correctIsAuth } from "../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware";
import { findEmployerItemDetails } from "../../modules/Company/BusinessItemsDetails/usecases/AppUser/findItemDetailsByCorrect";
import { findAllEmployerItemDetails } from "../../modules/Company/BusinessItemsDetails/usecases/AppUser/findAllByCorrect";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
import { createEmployerItemDetails } from "../../modules/Company/BusinessItemsDetails/usecases/CorrectAdmin/createEmployerItemByCorrect";
import { setEmployerCyclesController } from "../../modules/Company/BusinessItemsDetails/usecases/CorrectAdmin/updateEmployerCyclesByCorrect";
import { findAllEmployerItemDetailsBusinessAdmin } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessAdmin/findAllByBusinessAdmin";
import { findEmployerItemDetailsByBusiness } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessAdmin/findItemDetailsByBusinessAdmin";

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


/*****BUSINESS ENDPOINTS****** */

//find many by business admin - TESTED
businessItemDetailsRouter.get("/business/item/details", companyIsAuth, async (request, response) => {
  await findAllEmployerItemDetailsBusinessAdmin.handle(request, response)
})

//find single by business admin - TESTED
businessItemDetailsRouter.get("/business/item/details/:id/employer", companyIsAuth, async (request, response) => {
  await findEmployerItemDetailsByBusiness.handle(request, response)
})
