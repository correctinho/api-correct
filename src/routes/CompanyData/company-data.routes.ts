import { Router, request } from "express";
import { correctIsAuth } from "../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware";
import { updateBusinessInfo } from "../../modules/Company/CompanyData/usecases/update-business-info";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
import { getCompanyDataController } from "../../modules/Company/CompanyData/usecases/get-company-data";

export const companyDataRouter = Router()

//update company data by Correct Admin
companyDataRouter.patch('/business/info/correct', correctIsAuth, async (request, response) => {
    await updateBusinessInfo.handle(request, response)
})

//get business data by company admin
companyDataRouter.get('/business/info', companyIsAuth, async (request, response) => {
    await getCompanyDataController.handle(request, response)
})