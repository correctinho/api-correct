import { CustomError } from "../../../../../../errors/custom.error";
import { ICompanyDataRepository } from "../../../../../Company/CompanyData/repositories/company-data.repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { OutputFindUserByUserDTO } from "./dto/get-user-by-user.dto";

export class GetUserInfoByUserUsecase {
  constructor(
    private appUsersRepository: IAppUserInfoRepository,
    private businessInfoRepository: ICompanyDataRepository
  ) {}

  async execute(userdocument: string): Promise<OutputFindUserByUserDTO> {
    // Buscar informações do usuário pelo documento processado
    const userInfo = await this.appUsersRepository.findByDocumentUserInfo(userdocument);
    if (!userInfo) throw new CustomError("User info not found", 404);

    // Buscar informações dos negócios associados ao usuário
    const businessInfoList = userInfo.business_info_uuids
      ? await Promise.all(
          userInfo.business_info_uuids.map(async (uuid) => {
            return await this.businessInfoRepository.findById(uuid);
          })
        )
      : [];

    // Retornar as informações do usuário e dos negócios, se disponíveis
    return {
      uuid: userInfo.uuid.uuid,
      address_uuid: userInfo.address_uuid?.uuid || null,
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
      BusinessInfoList: businessInfoList.length > 0
        ? businessInfoList.map(businessInfo => ({
            uuid: businessInfo.uuid,
            fantasy_name: businessInfo.fantasy_name
          }))
        : [],
    };
  }

}
