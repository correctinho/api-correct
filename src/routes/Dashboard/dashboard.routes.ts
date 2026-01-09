import { Router } from "express"
import { getEmployerDashbardoMetricsController } from "../../modules/Dashboards/Employer/usecases"
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware"
import { getPartnerDashboardController } from "../../modules/Dashboards/Partner/usecases"

const dashboardRouter = Router()

dashboardRouter.get("/employer/dashboard", companyIsAuth, async (request, response) => {
    await getEmployerDashbardoMetricsController.handle(request, response)
})

dashboardRouter.get("/partner/dashboard", companyIsAuth, async (request, response) => {
    await getPartnerDashboardController.handle(request, response)
})

export { dashboardRouter }