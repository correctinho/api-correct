import { Router } from "express";
import { appUserIsAuth } from "../../infra/shared/middlewares/AppUser/app-user-auth.middleware";
import { getBusinessCreditController } from "../../modules/Payments/Accounts/usecases/Business/get-business-credits";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";

const accountsRouter = Router()

accountsRouter.get('/business/admin/credits', companyIsAuth, async (request, response) => {
    await getBusinessCreditController.handle(request, response)
})

export {accountsRouter}