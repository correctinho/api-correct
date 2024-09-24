import { Router } from "express";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
import { updateAddressController } from "../../modules/Company/CompanyAddress/usecases/update-company-address-by-admin";

export const companyAddressRouter = Router()



//updateAddress by company admin TESTED
companyAddressRouter.put('/company-address', companyIsAuth, async (request, response) => {
    await updateAddressController.handle(request, response)
})
