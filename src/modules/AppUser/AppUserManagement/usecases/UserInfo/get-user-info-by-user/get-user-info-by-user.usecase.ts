import { CustomError } from "../../../../../../errors/custom.error";
import { ICompanyDataRepository } from "../../../../../Company/CompanyData/repositories/company-data.repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { InputFindUserByUserDTO, OutputFindUserByUserDTO } from "./dto/get-user-by-user.dto";

export class GetUserInfoByUserUsecase {
  constructor(
    private appUsersRepository: IAppUserInfoRepository,
    private businessInfoRepository: ICompanyDataRepository,

  ) { }

  async execute(userdocument: string): Promise<OutputFindUserByUserDTO> {
    const userInfo = await this.appUsersRepository.findByDocumentUserInfo(userdocument)
    if (!userInfo) throw new CustomError("User info not found", 404)

    let businessInfo = null;

    if (userInfo.business_info_uuid) {
      businessInfo = await this.businessInfoRepository.findById(userInfo.business_info_uuid.uuid)
    }

    return {
      uuid: userInfo.uuid,
      business_info_uuid: userInfo.business_info_uuid || null,
      address_uuid: userInfo.address_uuid || null,
      document: userInfo.document,
      document2: userInfo.document2 || null,
      document3: userInfo.document3 || null,
      full_name: userInfo.full_name,
      display_name: userInfo.display_name || null,
      internal_company_code: userInfo.internal_company_code || null,
      gender: userInfo.gender || null,
      email: userInfo.email || null,
      date_of_birth: userInfo.date_of_birth,
      phone: userInfo.phone || null,
      salary: userInfo.salary || null,
      company_owner: userInfo.company_owner,
      status: userInfo.status,
      function: userInfo.function || null,
      recommendation_code: userInfo.recommendation_code || null,
      marital_status: userInfo.marital_status || null,
      dependents_quantity: userInfo.dependents_quantity,
      created_at: userInfo.created_at || null,
      updated_at: userInfo.updated_at || null,
      BusinessInfo: businessInfo ? {
        fantasy_name: businessInfo.fantasy_name
      } : null,
    };
  }

  private processDocument(document: string) {
    const onlyNumbers = document.replace(/\D/g, '');
    return onlyNumbers
  }
}
