import { CustomError } from "../../../../../errors/custom.error";
import { IAppUserAuthRepository } from "../../../../AppUser/AppUserManagement/repositories/app-use-auth-repository";
import { ICompanyDataRepository } from "../../repositories/company-data.repository";
import { InputGetPartnerDetailsByAppUserDTO, OutputGetPartnerDetailsByAppUserResponse, Product } from "./dto/get-partner-details-by-app-user.dto";

export class GetPartnerDetailsByAppUserUsecase {
  constructor(
    private businessInfoRepository: ICompanyDataRepository,
  ) { }

  async execute(business_info_uuid: string):Promise<OutputGetPartnerDetailsByAppUserResponse> {
    if (!business_info_uuid) throw new CustomError("Business Info Uuid is required", 400);

    const partner = await this.businessInfoRepository.findPartnerDetailsByAppUser(business_info_uuid)
    if(!partner) throw new CustomError("Partner not found", 404);
    if(partner.business_type === 'empregador') throw new CustomError("Partner not found", 404);


    return {
      partner: {
        uuid: partner.uuid,
        fantasy_name: partner.fantasy_name,
        corporate_reason: partner.corporate_reason,
        document: partner.document,
        classification: partner.classification,
        colaborators_number: partner.colaborators_number,
        status: partner.status,
        phone_1: partner.phone_1,
        phone_2: partner.phone_2,
        email: partner.email,
        business_type: partner.business_type,
        employer_branch: partner.employer_branch,
        created_at: partner.created_at,
        updated_at: partner.updated_at,
      },
      address: {
        uuid: partner.Address?.uuid,
        line1: partner.Address?.line1,
        line2: partner.Address?.line2,
        line3: partner.Address?.line3,
        postal_code: partner.Address?.postal_code,
        neighborhood: partner.Address?.neighborhood,
        city: partner.Address?.city,
        state: partner.Address?.state,
        country: partner.Address?.country,
        created_at: partner.Address?.created_at,
        updated_at: partner.Address?.updated_at,
      },
      products: partner.Products.map((product: Product) => ({
        uuid: product.uuid,
        category_uuid: product.category_uuid,
        ean_code: product.ean_code,
        brand: product.brand,
        name: product.name,
        description: product.description,
        original_price: product.original_price,
        promotional_price: product.promotional_price,
        discount: product.discount,
        image_urls: product.image_urls,
        is_mega_promotion: product.is_mega_promotion,
        stock: product.stock,
        weight: product.weight,
        height: product.height,
        width: product.width,
        business_info_uuid: product.business_info_uuid,
        is_active: product.is_active,
        created_at: product.created_at,
        updated_at: product.updated_at,
      })),
    };
  }
}
