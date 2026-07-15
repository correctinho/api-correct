import { Router } from "express";
import { getActiveTermsByTypeController } from "../../modules/Terms/usecase/get-active-terms";
import { generateBusinessContractController } from "../../modules/Terms/usecase/generate-business-contract";
import { correctIsAuth } from "../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware";
import { getPendingBusinessContractController } from "../../modules/Terms/usecase/get-pending-business-contract";

const termsRouter = Router()

//Get Active Terms
termsRouter.get("/terms/active/:type", async (request: any, response: any) => {
    await getActiveTermsByTypeController.handle(request, response)
})

//Generate Business Contract
termsRouter.post("/terms/generate-business-contract/:business_info_uuid", correctIsAuth, async (request: any, response: any) => {
    await generateBusinessContractController.handle(request, response)
})

//Get Pending Business Contract
termsRouter.get("/terms/pending/:business_info_uuid", correctIsAuth, async (request: any, response: any) => {
    await getPendingBusinessContractController.handle(request, response)
})

export { termsRouter };
