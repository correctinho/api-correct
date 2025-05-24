import { Router } from "express";
import { createCategoryController } from "../../modules/Ecommerce/Categories/usecases/createCategory";
import { correctIsAuth } from "../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware";
import { findCategoryController } from "../../modules/Ecommerce/Categories/usecases/findCategory";
import { findAllCategoriesController } from "../../modules/Ecommerce/Categories/usecases/findAllCategories";

const ecommerceRouter = Router()

//Create Category by correct admin - Tested
ecommerceRouter.post('/ecommerce/category', correctIsAuth, async (request, response) => {
  await createCategoryController.handle(request, response)
})

//Find categry by uuid
ecommerceRouter.get('/ecommerce/category', async (request, response) => {
  await findCategoryController.handle(request, response)
})

// Find all categories
ecommerceRouter.get('/ecommerce/categories', async (request, response) => {
  await findAllCategoriesController.handle(request, response)
})

export { ecommerceRouter }
