import { CustomError } from "../../../../../errors/custom.error";
import { IPartnerConfigRepository } from "../../repositories/partner-config.repository";
import { InputGetPartnersByCategoryDTO } from "./dto/get-partner-by-category.dto";

export class GetPartnersByCategoryUsecase {
  constructor(
    private partnerConfigRepository: IPartnerConfigRepository
  ) { }
  async execute(data: InputGetPartnersByCategoryDTO) {
    if (!data.partner_category) throw new CustomError("Category is required", 400)
    if( !data.page) data.page = 1

    //Get all partners with specified category
    const partners = await this.partnerConfigRepository.findPartnersByCategory(data.partner_category, data.page, 15)
    return partners.map((partner: any) => {
      return {
        offer_product: partner.use_marketing ? true : false,
        business_info_uuid: partner.BusinessInfo.uuid,
        fantasy_name: partner.BusinessInfo.fantasy_name,
        title: partner.title,
        phone: partner.phone,
        description: partner.description,
        sales_type: partner.sales_type,
        latitude: partner.latitude,
        longitude: partner.longitude,
        Address: {
          uuid: partner.BusinessInfo.Address.uuid,
          line1: partner.BusinessInfo.Address.line1,
          line2: partner.BusinessInfo.Address.line2,
          line3: partner.BusinessInfo.Address.line3 ? partner.BusinessInfo.Address.line3 : null,
          postal_code: partner.BusinessInfo.Address.postal_code,
          city: partner.BusinessInfo.Address.city,
          state: partner.BusinessInfo.Address.state,
          country: partner.BusinessInfo.Address.country
        }

      }
    })
  }
}
