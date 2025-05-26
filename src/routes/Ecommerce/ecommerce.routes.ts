import { Router } from "express";
import { createCategoryController } from "../../modules/Ecommerce/Categories/usecases/createCategory";
import { correctIsAuth } from "../../infra/shared/middlewares/CorrectAdmin/correct-admin-auth.middleware";
import { findCategoryController } from "../../modules/Ecommerce/Categories/usecases/findCategory";
import { findAllCategoriesController } from "../../modules/Ecommerce/Categories/usecases/findAllCategories";
import { createProductController } from "../../modules/Ecommerce/Products/usecases/create-product";
import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
import multerConfig from "../../infra/shared/multer/multer.config";
import { uploadImage } from "../../infra/shared/multer/multer-memory.config";
import { createProductControllerOnMinio } from "../../modules/Ecommerce/Products/usecases/create-product/index-minio";
import { findBusinessProducts } from "../../modules/Ecommerce/Products/usecases/find-business-products";
import { findProductController } from "../../modules/Ecommerce/Products/usecases/find-product-by-id";

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

//Register product by business user - PRODUCTS ON SUPABASE
ecommerceRouter.post('/ecommerce/product/supabase', companyIsAuth, uploadImage.array('file', 5) ,async (request, response) => {
  await createProductController.handle(request, response)
})

//REgister product by business user - PRODUCTS ON MINIO
ecommerceRouter.post('/ecommerce/product', companyIsAuth, uploadImage.array('file', 5), async (request, response) => {
  await createProductControllerOnMinio.handle(request, response)
})

// find buiness products
ecommerceRouter.get('/ecommerce/business/products/:business_info_uuid', async (request, response) => {
 await findBusinessProducts.handle(request, response)
})

// find product by id
ecommerceRouter.get('/ecommerce/product/:product_uuid', async (request, response) => {
  await findProductController.handle(request, response)
})
export { ecommerceRouter }
