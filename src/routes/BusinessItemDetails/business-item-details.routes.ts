import { request, Router } from "express";
import { setEmployerCyclesController } from "../../modules/Company/BusinessItemsDetails/usecases/updateEmployerCycles";
import { correctIsAuth } from "../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware";
import { findEmployerItemDetails } from "../../modules/Company/BusinessItemsDetails/usecases/findItemDetails";
import { findAllEmployerItemDetails } from "../../modules/Company/BusinessItemsDetails/usecases/findAll";
import { createEmployerItemDetails } from "../../modules/Company/BusinessItemsDetails/usecases/createEmployerItemByCorrect";

export const businessItemDetailsRouter = Router()

//create employer item details by correct admin - not TESTED
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
