import { CustomError } from "../../../../../errors/custom.error";
import { IPartnerConfigRepository } from "../../repositories/partner-config.repository";

export type UpdatePartnerTaxesInputDto = {
  business_info_uuid: string;
  admin_tax: number;
  marketing_tax: number;
  market_place_tax: number;
  cashback_tax: number;
};

export class UpdatePartnerTaxesUsecase {
  constructor(private repository: IPartnerConfigRepository) {}

  async execute(input: UpdatePartnerTaxesInputDto): Promise<void> {
    const { business_info_uuid, admin_tax, marketing_tax, market_place_tax, cashback_tax } = input;

    const partnerConfig = await this.repository.findByPartnerId(business_info_uuid);

    if (!partnerConfig) {
      throw new CustomError('Partner config not found', 404);
    }

    // Convert values to properly scaled numbers for the entity (value * 10000)
    if (admin_tax !== undefined) {
      partnerConfig.changeAdminTax(Math.round(admin_tax * 10000));
    }
    if (marketing_tax !== undefined) {
      partnerConfig.changeMarketingTax(Math.round(marketing_tax * 10000));
    }
    if (market_place_tax !== undefined) {
      partnerConfig.changeMarketingPlaceTax(Math.round(market_place_tax * 10000));
    }
    if (cashback_tax !== undefined) {
      partnerConfig.changeCashbackTax(Math.round(cashback_tax * 10000));
    }

    await this.repository.update(partnerConfig);
  }
}
