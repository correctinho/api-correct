import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyDataRepository } from "../../repositories/company-data.repository";
import { InputGetPartnersByAppUserDTO, OutputGetPartnersByAppUserDTO } from "./dto/get-partner-by-app-user.dto";

export class GetPartnersByAppUserUsecase {
  constructor(
    private businessInfoRepository: ICompanyDataRepository,
  ) { }

  async execute(data: InputGetPartnersByAppUserDTO): Promise<OutputGetPartnersByAppUserDTO[] | []> {
    if (!data.page) throw new CustomError("Page is required", 400);
    if (!data.city) throw new CustomError("City is required", 400)

    const partners = await this.businessInfoRepository.findPartnersByAppUser(data.city, data.page, 15)

    if (partners.length === 0) return []

    return partners.map((partner: OutputGetPartnersByAppUserDTO) => ({
      uuid: partner.uuid,
      branch_uuid: partner.branch_uuid,
      fantasy_name: partner.fantasy_name,
      corporate_reason: partner.corporate_reason,
      document: partner.document,
      has_online_products: partner.Products.length > 0 ? true : false,
      Address: {
        ...partner.Address
      }
    }))
  }
}
