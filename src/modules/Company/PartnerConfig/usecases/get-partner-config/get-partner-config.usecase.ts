import { IPartnerConfigRepository } from "../../repositories/partner-config.repository";
import { InputGetPartnerConfigDTO, OutputGetPartnerConfigDTO } from "./dto/get-partner-config.dto";

export class GetPartnerConfigByBusinessAdminUsecase {
  constructor(
    private readonly partnerConfigRepository: IPartnerConfigRepository,
  ) {}

  async execute(data: InputGetPartnerConfigDTO): Promise<OutputGetPartnerConfigDTO | null> {
    const partnerConfig = await this.partnerConfigRepository.findByPartnerId(data.business_info_uuid);

    if (!partnerConfig) {
      return null;
    }

    const output: OutputGetPartnerConfigDTO = {
      uuid: partnerConfig.uuid.uuid,
      business_info_uuid: partnerConfig.business_info_uuid.uuid,
      main_branch: partnerConfig.main_branch.uuid,
      items_uuid: partnerConfig.items_uuid,
      admin_tax: partnerConfig.admin_tax,
      marketing_tax: partnerConfig.marketing_tax,
      use_marketing: partnerConfig.use_marketing,
      market_place_tax: partnerConfig.market_place_tax,
      use_market_place: partnerConfig.use_market_place,
      title: partnerConfig.title,
      phone: partnerConfig.phone,
      description: partnerConfig.description,
      sales_type: partnerConfig.sales_type,
      cashback_tax: partnerConfig.cashback_tax,
      created_at: partnerConfig.created_at,
    };

    return output;
  }
}
