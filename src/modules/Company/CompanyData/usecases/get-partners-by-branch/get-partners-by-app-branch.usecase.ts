import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyDataRepository } from "../../repositories/company-data.repository";
import { InputGetPartnersByBranchDTO } from "./dto/get-partners-by-branch.dto";

export class GetPartnersByBranchUsecase {
  constructor(
    private businessInfoRepository: ICompanyDataRepository,
  ){}

  async execute(data: InputGetPartnersByBranchDTO){
    if(!data.branch_uuid) throw new CustomError("Branch uuid is required", 400)
    if(!data.page) throw new CustomError("Page is required", 400)
    if(!data.city) throw new CustomError("City is required", 400)

    const partners = await this.businessInfoRepository.findPartnersByBranch(data.branch_uuid, data.page, 15)

    return partners.map((partner: any) => ({
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
