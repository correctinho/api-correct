import { Router } from "express";
import { businessRegisterController } from "../../modules/Company/BusinessFirstRegister/usecases/business-first-register";
import { correctIsAuth } from "../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware";
import { businessRegisterByCorrectController } from "../../modules/Company/BusinessFirstRegister/usecases/business-first-register-by-correct";
// import { deleteCompanyDataController } from "../../modules/Company/CompanyData/usecases/delete-company-data";

export const businessRegisterRouter = Router()

//create company data
businessRegisterRouter.post('/business/register', async (request, response) => {
    await businessRegisterController.handle(request, response)
})

//create company data by correct admin/user
businessRegisterRouter.post('/business/register/correct', correctIsAuth, async (request, response) => {
  await businessRegisterController.handle(request, response)
})
