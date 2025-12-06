import { Router } from "express";
import { appUserIsAuth } from "../../infra/shared/middlewares/AppUser/app-user-auth.middleware";
import { createServiceRequestController } from "../../modules/ServiceScheduling/usecases/RequestFlow/create-service-request";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
import { listProviderPendingController } from "../../modules/ServiceScheduling/usecases/ManagementViews/list-provider-pending-requests";
import { suggestSlotsController } from "../../modules/ServiceScheduling/usecases/RequestFlow/suggest-slots";
import { listUserRequestsController } from "../../modules/ServiceScheduling/usecases/UserViews/list-user-requests";
import { confirmAppointmentController } from "../../modules/ServiceScheduling/usecases/UserViews/confirm-appointment";
import { listProviderScheduledController } from "../../modules/ServiceScheduling/usecases/ManagementViews/list-provider-scheduled-requests";

const serviceScheduling = Router()

//Cria uma solicitação de serviço
serviceScheduling.post("/service-scheduling", appUserIsAuth, async (request, response) => {
    createServiceRequestController.handle(request, response)
})

//Busca o lista de solicitações pendentes para o provedor
serviceScheduling.get("/service-scheduling/provider/pending", companyIsAuth, async (Request, Response) => {
    listProviderPendingController.handle(Request, Response)
} )

//Sugere horários para uma solicitação de serviço
serviceScheduling.patch(
    "/service-scheduling/:requestId/suggest-slots",
    companyIsAuth,
    async (request, response) => {
        suggestSlotsController.handle(request, response);
    }
);

// Rota GET para listar os agendamentos e status do usuário logado (Visão do Usuário)
serviceScheduling.get("/service-scheduling/my-requests", appUserIsAuth, async (request, response) => {
    listUserRequestsController.handle(request, response)
})

serviceScheduling.patch("/service-scheduling/:requestId/confirm", appUserIsAuth, async (request, response) => {
    confirmAppointmentController.handle(request, response);
});

//Lista os agendamentos confirmados, ordenados por data (Agenda / Aba "Agendados")
serviceScheduling.get("/service-scheduling/provider/scheduled", companyIsAuth, async (request, response) => {
    listProviderScheduledController.handle(request, response);
});

export { serviceScheduling }