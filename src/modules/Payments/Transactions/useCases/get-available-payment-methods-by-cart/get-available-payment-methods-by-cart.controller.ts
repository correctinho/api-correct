import { Request, Response } from "express";
import { GetAvailablePaymentMethodsByCartUsecase } from "./get-available-payment-methods-by-cart.usecase";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { IPartnerConfigRepository } from "../../../../Company/PartnerConfig/repositories/partner-config.repository";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";
import { ICartRepository } from "../../../../Ecommerce/Carts/repositories/cart.repository";

export class GetAvailablePaymentMethodsByCartController {
  constructor(
    private cartRepository: ICartRepository,
    private userItemRepository: IAppUserItemRepository,
    private partnerConfigRepository: IPartnerConfigRepository,
    private businessInfoRepository: ICompanyDataRepository
  ) { }

  async handle(req: Request, res: Response) {
    try {
      const data: any = {};
      data.cart_uuid = req.params.cart_uuid;
      data.appUserId = req.appUser.appUserId;
      data.appUserInfoID = req.appUser.user_info_uuid;

      const usecase = new GetAvailablePaymentMethodsByCartUsecase(
        this.cartRepository,
        this.userItemRepository,
        this.partnerConfigRepository,
        this.businessInfoRepository
      );

      const result = await usecase.execute(data);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        error: err.message || "Internal server error",
      });
    }
  }
}
