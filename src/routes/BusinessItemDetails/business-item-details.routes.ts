import { getEmployerInvoicesController } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessPostPaidItemsManagement/get-employer-invoices";
import { listAllRechargeOrdersController } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessPrePaidItemsManagement/list-all-recharge-orders";
import { Router } from "express";
import { correctIsAuth } from "../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware";
import { findEmployerItemDetails } from "../../modules/Company/BusinessItemsDetails/usecases/CorrectAdmin/findItemDetailsByCorrect";
import { findAllEmployerItemDetails } from "../../modules/Company/BusinessItemsDetails/usecases/CorrectAdmin/findAllByCorrect";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
import { createEmployerItemDetails } from "../../modules/Company/BusinessItemsDetails/usecases/CorrectAdmin/createEmployerItemByCorrect";
import { setEmployerCyclesController } from "../../modules/Company/BusinessItemsDetails/usecases/CorrectAdmin/updateEmployerCyclesByCorrect";
import { findAllEmployerItemDetailsBusinessAdmin } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessAdmin/findAllByBusinessAdmin";
import { findEmployerItemDetailsByBusiness } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessAdmin/findItemDetailsByBusinessAdmin";
import { listCollaboratorsByBenefitController } from "../../modules/AppUser/AppUserManagement/usecases/UserItem/list-collaborators-by-benefit";
import { listBusinessOrdersByBusinessController } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessPrePaidItemsManagement/list-business-orders/index-by-business";
import { listBusinessOrdersByCorrectAdminController } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessPrePaidItemsManagement/list-business-orders/index-by-correct-admin";
import { approveRechargeOrder } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessPrePaidItemsManagement/approve-recharge-order";
import { getPostPaidConsumptionController } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessPostPaidItemsManagement/get-postpaid-consumption";
import { ensureApiKey } from "../../infra/shared/middlewares/ensureApiKey";
import { postpaidRolloverController } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessPostPaidItemsManagement/postpaid-rollover";
import { updateDefaultBenefitValueController } from "../../modules/Company/BenefitGroups/usecases/update-default-benefit-value";
import { uploadRechargeReceiptController } from "../../modules/Company/BusinessItemsDetails/usecases/BusinessPrePaidItemsManagement/upload-recharge-receipt";
import multer from "multer";
import { uploadImage, uploadDocument } from "../../infra/shared/multer/multer-memory.config";

export const businessItemDetailsRouter = Router()

/*****CORRECT ENDPOINTS****** */
// List ALL recharge orders (Correct Admin)
businessItemDetailsRouter.get(
    "/admin/recharge-orders",
    correctIsAuth,
    async (request, response) => {
        await listAllRechargeOrdersController.handle(request, response)
    }
)


//create employer item details by correct admin - TESTED
businessItemDetailsRouter.post("/business/item/details/correct", correctIsAuth, async (request, response) => {
  await createEmployerItemDetails.handle(request, response)
})
//update employer item details by correct admin - TESTED
businessItemDetailsRouter.patch('/business/item/details/correct', correctIsAuth, async (request, response) => {
  await setEmployerCyclesController.handle(request, response)
})

//update default benefit group value by correct admin
businessItemDetailsRouter.patch('/business/item/benefit-group/value/correct', correctIsAuth, async (request, response) => {
  await updateDefaultBenefitValueController.handle(request, response)
})

//find single by correct - TESTED
businessItemDetailsRouter.get("/business/item/details/:id/correct/", correctIsAuth, async (request, response) => {
  await findEmployerItemDetails.handle(request, response)
})

//find all employer items by correct - TESTED
businessItemDetailsRouter.get("/business/item/details/correct/:business_info_uuid/", correctIsAuth, async (request, response) => {
  await findAllEmployerItemDetails.handle(request, response)
})

//List business orders by correct admin
// businessItemDetailsRouter.get(
//     "/business/orders/:businessInfoUuid/:item_uuid",
//     correctIsAuth,
//     async (request, response) => {
//         await listBusinessOrdersByCorrectAdminController.handle(request, response)
//     }
// )



/*****BUSINESS ENDPOINTS****** */

//find many by business admin - TESTED
businessItemDetailsRouter.get("/business/item/details", companyIsAuth, async (request, response) => {
  await findAllEmployerItemDetailsBusinessAdmin.handle(request, response)
})

//find single by business admin - TESTED
businessItemDetailsRouter.get("/business/item/details/:id/employer", companyIsAuth, async (request, response) => {
  await findEmployerItemDetailsByBusiness.handle(request, response)
})

// LISTAR COLABORADORES DO BENEFÍCIO (Para a aba "Colaboradores")
// GET /business/item/details/:id/collaborators?page=1&limit=10&status=inactive
businessItemDetailsRouter.get(
    "/business/item/details/:id/collaborators",
    companyIsAuth,
    async (request, response) => {
        await listCollaboratorsByBenefitController.handle(request, response)
    }
)
//List business orders by business admin
businessItemDetailsRouter.get(
    "/business/orders/list/:item_uuid",
     companyIsAuth,
    async (request, response) => {
        await listBusinessOrdersByBusinessController.handle(request, response)
    }
)

//Approve recharge order endpoint
//Upload recharge order receipt
businessItemDetailsRouter.post(
    "/business/orders/:order_uuid/upload-receipt",
    companyIsAuth,
    uploadDocument.single("file"),
    async (request, response) => {
        await uploadRechargeReceiptController.handle(request, response)
    }
)

businessItemDetailsRouter.post(
    "/business/recharge-orders/approve",
    correctIsAuth,
    async (request, response) => {
        await approveRechargeOrder.handle(request, response)
    }
)

//get post paid consumption
businessItemDetailsRouter.get("/business/item/details/:employer_item_details_uuid/consumption", companyIsAuth, async (request, response) => {
    await getPostPaidConsumptionController.handle(request, response);
})

//Renew post paid limit for employee user item
businessItemDetailsRouter.post("/internal/webhooks/postpaid-rollover", ensureApiKey, async (request, response) => {
  await postpaidRolloverController.handle(request, response)
})

// List Employer Invoices
businessItemDetailsRouter.get("/business/invoices", companyIsAuth, async (request, response) => {
    await getEmployerInvoicesController.handle(request, response);
});
