import { Router, request, response } from "express";
import uploadConfig from '../../infra/shared/multer/multer.csv.memory.config'
import multer from 'multer'
import { authenticateAppUserController } from "../../modules/AppUser/AppUserManagement/usecases/UserAuth/app-user-authentication";
import { appUserIsAuth } from "../../infra/shared/middlewares/AppUser/app-user-auth.middleware";
import { userDetailsController } from "../../modules/AppUser/AppUserManagement/usecases/UserAuth/app-user-details";
import { createDocumentsController } from "../../modules/AppUser/AppUserManagement/usecases/DocumentsValidation/create-documents-validation";
import { appUserAuthSignUpController } from "../../modules/AppUser/AppUserManagement/usecases/UserAuth/app-user-signup";
import { getByDocumentController } from "../../modules/AppUser/AppUserManagement/usecases/UserAuth/get-by-document";
import { createUserInfoController } from "../../modules/AppUser/AppUserManagement/usecases/UserInfo/create-user-info";
import { createUserAddressController } from "../../modules/AppUser/AppUserManagement/usecases/UserAddress/create-app-user-address";
import { correctIsAuth } from "../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware";
import { createAppUserByCorrectController } from "../../modules/AppUser/UserByCorrect/usecases/create-appuser-data-by-correct";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
import { getUsersByAdmin } from "../../modules/AppUser/AppUserManagement/usecases/UserInfo/get-users-by-business-admin";
import { getSingleUserByAdmin } from "../../modules/AppUser/AppUserManagement/usecases/UserInfo/get-single-user-by-business-admin";
import { getUserInfobyUser } from "../../modules/AppUser/AppUserManagement/usecases/UserInfo/get-user-info-by-user";
import { getUserAddressController } from "../../modules/AppUser/AppUserManagement/usecases/UserAddress/get-app-user-address";
import { updateUserAddressController } from "../../modules/AppUser/AppUserManagement/usecases/UserAddress/update-app-user-address";
import { createUserInfoByEmployerController } from "../../modules/AppUser/AppUserManagement/usecases/UserInfo/create-user-info-by-employer";

const appUserRouter = Router()
const upload = multer(uploadConfig.upload())


//**********User Auth*********** */

//sign up user
appUserRouter.post('/app-user', async (request, response) => {
    await appUserAuthSignUpController.handle(request, response)
})

//Login AppUser
appUserRouter.post("/login-app-user", async (request, response) => {
    await authenticateAppUserController.handle(request, response)
})

//User details Authenticated by user
appUserRouter.get("/app-user", appUserIsAuth, async (request, response) => {
    await userDetailsController.handle(request, response)
})


//**********User Info*********** */

//user Details by document - TESTED
appUserRouter.get("/app-user/document/:document", async (request, response) => {
    await getByDocumentController.handle(request, response)
})

//register user info by authenticated user - TESTED
appUserRouter.post("/app-user/info", appUserIsAuth, async (request, response) => {
    await createUserInfoController.handle(request, response)
})


//get user info by user - TESTED
appUserRouter.get("/app-user/info", appUserIsAuth, async (request, response) => {
    await getUserInfobyUser.handle(request, response)
})


//Register app users by Correct - TESTED
appUserRouter.post("/app-users-by-correct", correctIsAuth, upload.single('file'), async (request, response) => {
    await createAppUserByCorrectController.handle(request, response)
})

//Get app users by business admin - TESTED
appUserRouter.get("/business-admin/app-users", companyIsAuth, async (request, response) => {
    await getUsersByAdmin.handle(request, response)
})

//Get user details by business admin - TESTED
appUserRouter.get("/app-user/business-admin", companyIsAuth, async (request, response) => {
    await getSingleUserByAdmin.handle(request, response)
})

//Register single employee by company admin
appUserRouter.post("/app-user/business-admin", companyIsAuth, async (request, response) => {
  await createUserInfoByEmployerController.handle(request, response)
})

//**********User Address*********** */

//create app user address by authenticated user
appUserRouter.post("/app-user/address", appUserIsAuth, async (request, response) => {
    await createUserAddressController.handle(request, response)
})

//get app user address by authenticated user
appUserRouter.get("/app-user/address", appUserIsAuth, async (request, response) => {
    await getUserAddressController.handle(request, response)
})

//update appuser address by authenticated user
appUserRouter.put("/app-user/address", appUserIsAuth, async (request, response) => {
    await updateUserAddressController.handle(request, response)
})

//**********Document Validation*********** */

//create documents for validation
appUserRouter.post("/app-user/document-validation", appUserIsAuth, async (request, response) => {
    await createDocumentsController.handle(request, response)
})




export { appUserRouter }
