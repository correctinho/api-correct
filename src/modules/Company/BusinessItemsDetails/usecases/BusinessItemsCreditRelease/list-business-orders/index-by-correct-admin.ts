import { BusinessOrderPrismaRepository } from "../../../repositories/implementations/business-order-prisma.repository";
import { ListBusinessOrdersByCorrectAdminController } from "./list-business-orders-by-correct-admin.controller";
const businessOrderRepository = new BusinessOrderPrismaRepository();

const listBusinessOrdersByCorrectAdminController = new ListBusinessOrdersByCorrectAdminController(
    businessOrderRepository
);

export { listBusinessOrdersByCorrectAdminController };