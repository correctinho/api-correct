import { CartPrismaRepository } from "../../repositories/implementations/cart-prisma.repository";
import { UpdateCartItemQuantityController } from "./update-cart-item-quantity.controller";

const cartRepository = new CartPrismaRepository()
const updateCartItem = new UpdateCartItemQuantityController(
    cartRepository
)

export { updateCartItem }