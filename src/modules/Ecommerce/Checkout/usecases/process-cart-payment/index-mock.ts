import { ProcessCartPaymentUseCase } from "./process-cart-payment.usecase";
import { ProcessCartPaymentController } from "./process-cart-payment.controller";
import { CartPrismaRepository } from "../../../Carts/repositories/implementations/cart-prisma.repository";
import { AppUserItemPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { PartnerConfigPrismaRepository } from "../../../../Company/PartnerConfig/repositories/implementations/prisma/partner-config-prisma.repository";
import { EcommerceCheckoutPrismaRepository } from "../../repositories/implementations/ecommerce-checkout-prisma.repository";
import { TaxiMachineProvider } from "../../../../../infra/providers/deliveries/TaxiMachineProvider/TaxiMachineProvider";
import { CompanyAddressPrismaRepository } from "../../../../Company/CompanyAddress/repositories/implementations/company-address-prisma.repository";
import { AppUserInfoPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { MockTaxiMachineDeliveryProvider } from "../../../Deliveries/mockTaxiMachineProvider";

const cartRepository = new CartPrismaRepository();
const userItemRepository = new AppUserItemPrismaRepository();
const partnerConfigRepository = new PartnerConfigPrismaRepository();
const ecommerceCheckoutRepository = new EcommerceCheckoutPrismaRepository();
const deliveryProvider = new MockTaxiMachineDeliveryProvider();
const companyAddressRepository = new CompanyAddressPrismaRepository();
const userInfoRepository = new AppUserInfoPrismaRepository();

const processCartPaymentUseCase = new ProcessCartPaymentUseCase(
  cartRepository,
  userItemRepository,
  partnerConfigRepository,
  ecommerceCheckoutRepository,
  deliveryProvider,
  companyAddressRepository,
  userInfoRepository
);

const processCartPaymentController = new ProcessCartPaymentController(
  processCartPaymentUseCase
);

export { processCartPaymentController };
