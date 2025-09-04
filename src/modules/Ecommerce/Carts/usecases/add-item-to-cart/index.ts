import { ProductPrismaRepository } from "../../../Products/repositories/implementations/product-prisma.repository";
import { CartPrismaRepository } from "../../repositories/implementations/cart-prisma.repository";
import { AddItemToCartController } from "./add-item-to-cart.controller";

const cartRepository = new CartPrismaRepository()
const productRepository = new ProductPrismaRepository()

const addItemToCart = new AddItemToCartController(
    cartRepository,
    productRepository
)

export { addItemToCart }