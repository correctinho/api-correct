import { CartPrismaRepository } from "../../repositories/implementations/cart-prisma.repository";
import { DeleteCartItemController } from "./delete-cart-item.controller";

const cartRepository = new CartPrismaRepository()
const deleteCartItemController = new DeleteCartItemController(cartRepository)

export { deleteCartItemController };