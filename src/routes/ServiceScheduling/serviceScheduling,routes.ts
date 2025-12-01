import { Router } from "express";
import { appUserIsAuth } from "../../infra/shared/middlewares/AppUser/app-user-auth.middleware";
import { createServiceRequestController } from "../../modules/ServiceScheduling/usecases/RequestFlow/create-service-request";

const serviceScheduling = Router()

//Cria uma solicitação de serviço
serviceScheduling.post("/service-scheduling", appUserIsAuth, async (request, response) => {
    createServiceRequestController.handle(request, response)
})

export { serviceScheduling }