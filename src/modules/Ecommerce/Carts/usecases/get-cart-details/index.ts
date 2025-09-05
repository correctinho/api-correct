import { CartPrismaRepository } from "../../repositories/implementations/cart-prisma.repository";
import { GetCartDetailsController } from "./get-cart-details.controller";

const cartRepository = new CartPrismaRepository()

const getCartDetailsController = new GetCartDetailsController(cartRepository)

export { getCartDetailsController }