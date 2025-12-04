import { Router } from "express";
import { appUserIsAuth } from "../../infra/shared/middlewares/AppUser/app-user-auth.middleware";
import { createServiceRequestController } from "../../modules/ServiceScheduling/usecases/RequestFlow/create-service-request";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
import { listProviderPendingController } from "../../modules/ServiceScheduling/usecases/ManagementViews/list-provider-pending-requests";

const serviceScheduling = Router()

//Cria uma solicitação de serviço
serviceScheduling.post("/service-scheduling", appUserIsAuth, async (request, response) => {
    createServiceRequestController.handle(request, response)
})

serviceScheduling.get("/service-scheduling/provider/pending", companyIsAuth, async (Request, Response) => {
    listProviderPendingController.handle(Request, Response)
} )

export { serviceScheduling }