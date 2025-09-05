import { CartPrismaRepository } from "../../repositories/implementations/cart-prisma.repository";
import { ListUserCartsController } from "./list-user-carts.controller";

const cartRepository = new CartPrismaRepository();
const listCartsController = new ListUserCartsController(
    cartRepository
);

export { listCartsController };