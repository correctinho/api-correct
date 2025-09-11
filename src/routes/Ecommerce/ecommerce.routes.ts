import { Router } from "express";
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
import { uploadProducImageController } from "../../modules/Ecommerce/Products/usecases/upload-product-images";
import multer from "multer";
import uploadConfig from '../../infra/shared/multer/multer.csv.memory.config'
import { deleteProductController } from "../../modules/Ecommerce/Products/usecases/delete-product";
import { updateProduct } from "../../modules/Ecommerce/Products/usecases/update-product";
import { appUserIsAuth } from "../../infra/shared/middlewares/AppUser/app-user-auth.middleware";
import { createCategoryController } from "../../modules/Ecommerce/Categories/usecases/createCategory";
import { addItemToCart } from "../../modules/Ecommerce/Carts/usecases/add-item-to-cart";
import { updateCartItem } from "../../modules/Ecommerce/Carts/usecases/update-cart-item-quantity";
import { deleteCartItemController } from "../../modules/Ecommerce/Carts/usecases/delete-cart-item";
import { listCartsController } from "../../modules/Ecommerce/Carts/usecases/list-user-carts";
import { getCartDetailsController } from "../../modules/Ecommerce/Carts/usecases/get-cart-details";

const ecommerceRouter = Router()
const upload = multer(uploadConfig.upload())

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

//REgister product by business user 
ecommerceRouter.post('/ecommerce/product', companyIsAuth, uploadImage.array('file', 5), async (request, response) => {
  await createProductControllerOnMinio.handle(request, response)
})

//upload product images - PRODUCTS ON SUPABASE
ecommerceRouter.post('/ecommerce/product/:product_uuid/images', companyIsAuth, uploadImage.array('file', 5), async (request, response) => {
  await uploadProducImageController.handle(request, response)
})

// find public business products
ecommerceRouter.get('/ecommerce/business/:business_info_uuid/products', async (request, response) => {
  await findBusinessProducts.handle(request, response)
})
ecommerceRouter.get('/ecommerce/business/products', companyIsAuth, async (request, response) => {
  await findBusinessProducts.handle(request, response)
})

// find product by id
ecommerceRouter.get('/ecommerce/product/:product_uuid', async (request, response) => {
  await findProductController.handle(request, response)
})

//delete product
ecommerceRouter.patch('/ecommerce/product/:product_uuid/delete', companyIsAuth, async (request, response) => {
  await deleteProductController.handle(request, response)
})

//update product
ecommerceRouter.put('/ecommerce/product/:productId', companyIsAuth, async (request, response) => {
  await updateProduct.handle(request, response)
})

//delete product images
ecommerceRouter.patch('/ecommerce/product/:productId/images/delete', companyIsAuth, async (request, response) => {
  await deleteProductController.handle(request, response)
})

//add item to cart by appuser
ecommerceRouter.post('/ecommerce/cart/item', appUserIsAuth, async (request, response) => {
  await addItemToCart.handle(request, response)
})

//update item quantity in cart
ecommerceRouter.patch('/ecommerce/cart/item/:itemId', appUserIsAuth, async (request, response) => {
  await updateCartItem.handle(request, response)
})

//delete item from cart
ecommerceRouter.delete('/ecommerce/cart/item/:itemId', appUserIsAuth, async (request, response) => {
  await deleteCartItemController.handle(request, response)
})

//get user carts
ecommerceRouter.get('/ecommerce/user/carts', appUserIsAuth, async (request, response) => {
  await listCartsController.handle(request, response)
})

//get cart details by id
ecommerceRouter.get('/ecommerce/cart/:cartId', appUserIsAuth, async (request, response) => {
  await getCartDetailsController.handle(request, response)
})
export { ecommerceRouter }
