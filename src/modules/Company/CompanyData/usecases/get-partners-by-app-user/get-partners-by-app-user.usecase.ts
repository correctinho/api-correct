import { CustomError } from "../../../../../errors/custom.error";
import { IAppUserAuthRepository } from "../../../../AppUser/AppUserManagement/repositories/app-use-auth-repository";
import { ICompanyDataRepository } from "../../repositories/company-data.repository";
import { InputGetPartnersByAppUserDTO } from "./dto/get-partner-by-app-user.dto";

export class GetPartnersByAppUserUsecase {
  constructor(
    private businessInfoRepository: ICompanyDataRepository,
  ){}

  async execute(data: InputGetPartnersByAppUserDTO){
    if(!data.page) throw new CustomError("Page is required", 400);
    if(!data.city) throw new CustomError("City is required", 400)

    const partners = await this.businessInfoRepository.findPartnersByAppUser(data.city, data.page, 15)

    return partners.map((partner: any) => ({
      uuid: partner.uuid,
      fantasy_name: partner.fantasy_name,
      corporate_reason: partner.corporate_reason,
      document: partner.document,
      Address: {
        ...partner.Address
      }
    }))
  }
}
