import { Router } from "express";
import { getActiveTermsByTypeController } from "../../modules/Terms/usecase/get-active-terms";

const termsRouter = Router()

//Get Active Terms
termsRouter.get("/terms/active/:type"), async (request: any, response: any) => {
    await getActiveTermsByTypeController.handle(request, response)
}

export { termsRouter };
