import { Router } from "express";
import { businessRegisterController } from "../../modules/Company/BusinessFirstRegister/usecases/business-first-register";
import { businessRegisterSelfServiceController } from "../../modules/Company/BusinessFirstRegister/usecases/business-first-register-self-service";
import { correctIsAuth } from "../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware";
import { businessRegisterByCorrectController } from "../../modules/Company/BusinessFirstRegister/usecases/business-first-register-by-correct";
import { generateOnboardingPixController } from "../../modules/Company/onboarding/usecases/generate-onboarding-pix";
import { checkBusinessStatusController } from "../../modules/Company/BusinessFirstRegister/usecases/check-business-status";
// import { deleteCompanyDataController } from "../../modules/Company/CompanyData/usecases/delete-company-data";

export const businessRegisterRouter = Router()

//create company data
businessRegisterRouter.post('/business/register', async (request, response) => {
    await businessRegisterSelfServiceController.handle(request, response)
})

//create company data by correct admin/user
businessRegisterRouter.post('/business/register/correct', correctIsAuth, async (request, response) => {
  await businessRegisterController.handle(request, response)
})

//generate onboarding pix
businessRegisterRouter.post('/business/:uuid/onboarding-pix', async (request, response) => {
    await generateOnboardingPixController.handle(request, response)
})

//check business status
businessRegisterRouter.get('/business/check/:document', async (request, response) => {
    await checkBusinessStatusController.handle(request, response)
})
