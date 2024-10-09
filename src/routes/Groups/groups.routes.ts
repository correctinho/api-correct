import { Router } from "express";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
import { createBenefitGroupController } from "../../modules/Company/BenefitGroups/usecases/create-by-employer";
import { getAllBenefitGroupsController } from "../../modules/Company/BenefitGroups/usecases/get-all-by-employer";
import { getOneBenefitGroupsController } from "../../modules/Company/BenefitGroups/usecases/get-one-by-employer";

const groupsRouter = Router()

groupsRouter.post("/business-admin/group", companyIsAuth, async (request, response) => {
  await createBenefitGroupController.handle(request, response)
})

groupsRouter.get("/business-admin/groups", companyIsAuth, async (request, response) => {
  await getAllBenefitGroupsController.handle(request, response)
})

groupsRouter.get("/business-admin/group", companyIsAuth, async (request, response) => {
  await getOneBenefitGroupsController.handle(request, response)
})
export { groupsRouter }
