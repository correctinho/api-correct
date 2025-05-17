import { Router } from "express";
import { companyUserController } from "../../modules/Company/CompanyUser/usecases/create-company-admin";
import { authCompanyUserController } from "../../modules/Company/CompanyUser/usecases/authenticate-company-user";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
import { companyUserDetailsController } from "../../modules/Company/CompanyUser/usecases/company-user-details";
import { deleteUserController } from "../../modules/Company/CompanyUser/usecases/delete-user";
import { getUsersController } from "../../modules/Company/CompanyUser/usecases/get-users";
import { getSingleUserController } from "../../modules/Company/CompanyUser/usecases/get-single-user";
import { correctIsAuth } from "../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware";
import { companyUserByAdminController } from "../../modules/Company/CompanyUser/usecases/create-company-user";
import { confirmPasswordController } from "../../modules/Company/CompanyUser/usecases/confirm-password";
import { updateUserController } from "../../modules/Company/CompanyUser/usecases/update-admin-by-admin";
import { updateAdminController } from "../../modules/Company/CompanyUser/usecases/update-user-by-admin";
import { getBusinessAccountController } from "../../modules/Payments/Accounts/usecases/Business/get-business-account-by-admin";


export const companyUserRouter = Router()

 //Create Company admin by correct - TESTED
companyUserRouter.post('/business/admin/correct', correctIsAuth, async (request, response) => {
    await companyUserController.handle(request, response)
})

//authenticate business user - TESTED
companyUserRouter.post('/business/admin/login', async (request, response) => {
    await authCompanyUserController.handle(request, response)
})

//get user details - TESTED
companyUserRouter.get('/business/admin/details', companyIsAuth, async (request, response) => {
    await companyUserDetailsController.handle(request, response)
})

//update company admin by company admin - TESTED
companyUserRouter.put("/company-admin", companyIsAuth, async (request, response) => {
  await updateAdminController.handle(request, response)
})

//update company user by company admin - TESTED
companyUserRouter.patch("/company-user", companyIsAuth, async (request, response) => {
  await updateUserController.handle(request, response)
})

//create company user by company admin - TESTED
companyUserRouter.post('/business/admin/register/user', companyIsAuth, async (request, response) => {
    await companyUserByAdminController.handle(request, response)
})


//get single User by authenticated admin - //TESTED
companyUserRouter.get("/business/admin/details/user", companyIsAuth, async (request, response) => {
    await getSingleUserController.handle(request, response)
})

//get users by authenticated admin - //TESTED
companyUserRouter.get('/company-users', companyIsAuth, async (request, response) => {
    await getUsersController.handle(request, response)
})


//Delete User By company Admin - //TESTED
companyUserRouter.patch("/company-user/delete", companyIsAuth, async (request, response) => {
    await deleteUserController.handle(request, response)
})

//Password confirmation - //TESTED
companyUserRouter.post("/confirm-password", companyIsAuth, async (request, response) => {
    await confirmPasswordController.handle(request, response)
})


//Get Business Account
companyUserRouter.get('/business/admin/account', companyIsAuth, async (request, response) => {
  await getBusinessAccountController.handle(request, response)
})
