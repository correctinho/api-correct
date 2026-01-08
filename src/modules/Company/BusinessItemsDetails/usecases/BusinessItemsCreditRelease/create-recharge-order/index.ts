import { AppUserItemPrismaRepository } from "../../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { BusinessOrderPrismaRepository } from "../../../repositories/implementations/business-order-prisma.repository";
import { CreateRechargeOrderController } from "./create-recharge-order.controller";

const businessOrderRepository = new BusinessOrderPrismaRepository();
const appUserItemRepository = new AppUserItemPrismaRepository();

const createRechargeOrderController = new CreateRechargeOrderController(
    businessOrderRepository,
    appUserItemRepository
);
export { createRechargeOrderController };