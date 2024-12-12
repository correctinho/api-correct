import { Router } from "express";
import { correctIsAuth } from "../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware";
import { updateBusinessInfo } from "../../modules/Company/CompanyData/usecases/update-business-info";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
import { getCompanyDataController } from "../../modules/Company/CompanyData/usecases/get-company-data";
import { appUserIsAuth } from "../../infra/shared/middlewares/AppUser/app-user-auth.middleware";
import { getPartnersByAppUser } from "../../modules/Company/CompanyData/usecases/get-partners-by-app-user";
import { getPartnerDetailsByAppUser } from "../../modules/Company/CompanyData/usecases/get-partner-details-by-app-user";
import { getPartnersByBranch } from "../../modules/Company/CompanyData/usecases/get-partners-by-branch";
import { createPartnerConfigController } from "../../modules/Company/PartnerConfig/usecases/create-partner-config";
import { getRegisterPartnerBySeller } from "../../modules/Company/CompanyData/usecases/get-company-data-by-correct-seller";

export const companyDataRouter = Router()

//update company data by Correct Admin TESTED
companyDataRouter.put('/business/info/correct', correctIsAuth, async (request, response) => {
    await updateBusinessInfo.handle(request, response)
})

//update company data by Company admin TESTED
companyDataRouter.put('/business/info/company', companyIsAuth, async (request, response) => {
  await updateBusinessInfo.handle(request, response)
})

//get business data by company admin TESTED
companyDataRouter.get('/business/info', companyIsAuth, async (request, response) => {
    await getCompanyDataController.handle(request, response)
})

//get partners by app user
companyDataRouter.get('/partners/list', appUserIsAuth, async (request, response) => {
  await getPartnersByAppUser.handle(request, response)
})

//get partner details by app user
companyDataRouter.get('/partner/app-user', appUserIsAuth, async (request, response) => {
  await getPartnerDetailsByAppUser.handle(request, response)
})


//get partners by branch
companyDataRouter.get('/partner/branch', appUserIsAuth, async (request, response) => {
  await getPartnersByBranch.handle(request, response)
})

//get registered partner by correct seller (with limitations - check code)
companyDataRouter.get("/partner/seller", correctIsAuth, async (request, response) => {
  await getRegisterPartnerBySeller.handle(request, response)
})

//create partner config by correct admin
companyDataRouter.post("/partner/config", correctIsAuth, async (request, response) => {
  await createPartnerConfigController.handle(request, response)
})
