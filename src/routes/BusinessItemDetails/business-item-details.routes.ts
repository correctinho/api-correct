import { request, Router } from "express";
import { setEmployerCyclesController } from "../../modules/Company/BusinessItemsDetails/usecases/updateEmployerCycles";
import { correctIsAuth } from "../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware";
import { findEmployerItemDetails } from "../../modules/Company/BusinessItemsDetails/usecases/findItemDetails";
import { findAllEmployerItemDetails } from "../../modules/Company/BusinessItemsDetails/usecases/findAll";

export const businessItemDetailsRouter = Router()

//update employer item details by correct admin - NOT Tested
businessItemDetailsRouter.patch('/business/item/details/correct', correctIsAuth, async (request, response) => {
  await setEmployerCyclesController.handle(request, response)
})

//find single by correct
businessItemDetailsRouter.get("/business/item/details/:id/correct/", correctIsAuth, async (request, response) => {
  await findEmployerItemDetails.handle(request, response)
})

//find all employer items by correct
businessItemDetailsRouter.get("/business/item/details/correct/:business_info_uuid/", correctIsAuth, async (request, response) => {
  await findAllEmployerItemDetails.handle(request, response)
})
