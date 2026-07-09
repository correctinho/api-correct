import { AppUserItemPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { CompanyDataPrismaRepository } from "../../../../Company/CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { PartnerConfigPrismaRepository } from "../../../../Company/PartnerConfig/repositories/implementations/prisma/partner-config-prisma.repository";
import { CartPrismaRepository } from "../../../../Ecommerce/Carts/repositories/implementations/cart-prisma.repository";
import { GetAvailablePaymentMethodsByCartController } from "./get-available-payment-methods-by-cart.controller";

const cartRepository = new CartPrismaRepository();
const userItemRepository = new AppUserItemPrismaRepository();
const partnerConfigRepository = new PartnerConfigPrismaRepository();
const businessInfoRepository = new CompanyDataPrismaRepository();

const getAvailablePaymentMethodsByCartController = new GetAvailablePaymentMethodsByCartController(
  cartRepository,
  userItemRepository,
  partnerConfigRepository,
  businessInfoRepository
);

export { getAvailablePaymentMethodsByCartController };
