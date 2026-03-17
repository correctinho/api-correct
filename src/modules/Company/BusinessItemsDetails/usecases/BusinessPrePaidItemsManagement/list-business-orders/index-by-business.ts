import { BusinessOrderPrismaRepository } from "../../../repositories/implementations/business-order-prisma.repository";
import { ListBusinessOrdersByBusinessController } from "./list-business-orders-by-business.controller";

const businessOrderRepository = new BusinessOrderPrismaRepository();

const listBusinessOrdersByBusinessController = new ListBusinessOrdersByBusinessController(
    businessOrderRepository
);

export { listBusinessOrdersByBusinessController };