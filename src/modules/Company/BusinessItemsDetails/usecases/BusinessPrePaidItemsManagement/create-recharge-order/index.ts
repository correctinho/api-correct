import { AppUserItemPrismaRepository } from "../../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { BusinessOrderPrismaRepository } from "../../../repositories/implementations/business-order-prisma.repository";
import { CompanyDataPrismaRepository } from "../../../../CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { SicrediPixProvider } from "../../../../../../infra/providers/PixProvider/implementations/sicredi/sicredi-pix.provider";
import { CreateRechargeOrderController } from "./create-recharge-order.controller";

const businessOrderRepository = new BusinessOrderPrismaRepository();
const appUserItemRepository = new AppUserItemPrismaRepository();
const businessInfoRepository = new CompanyDataPrismaRepository();
const pixProvider = new SicrediPixProvider();

const createRechargeOrderController = new CreateRechargeOrderController(
    businessOrderRepository,
    appUserItemRepository,
    businessInfoRepository,
    pixProvider
);
export { createRechargeOrderController };
