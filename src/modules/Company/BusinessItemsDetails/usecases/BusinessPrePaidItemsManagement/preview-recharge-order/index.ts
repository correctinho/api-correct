import { AppUserItemPrismaRepository } from "../../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { PreviewRechargeOrderController } from "./preview-recharge-order.controller";

const appUserItemRepository = new AppUserItemPrismaRepository();
const previewRechargeOrderController = new PreviewRechargeOrderController(appUserItemRepository);

export { previewRechargeOrderController };