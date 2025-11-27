import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { IAppUserToken } from "../../../../../../infra/shared/crypto/token/AppUser/token";
import { ICompanyDataRepository } from "../../../../../Company/CompanyData/repositories/company-data.repository";
import { IOfflineTokenRepository } from "../../../../../Payments/OfflineTokens/repositories/offline-tokens.repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { OutputFindUserByUserDTO, OutputFindUserDTO } from "./dto/get-user-by-user.dto";

export class GetUserInfoByUserUsecase {
  constructor(
    private appUsersRepository: IAppUserInfoRepository,
    private activeTokenRepository: IOfflineTokenRepository
  ) { }

  async execute(userdocument: string): Promise<OutputFindUserDTO> {
    // Buscar informações do usuário pelo documento processado
    const userInfo = await this.appUsersRepository.findByDocumentUserInfo(userdocument);
    if (!userInfo) throw new CustomError("User info not found", 404);

    //Verifica se ele tem o token offline ativado ou não
    const activeToken = await this.activeTokenRepository.checkActiveTokensByUserInfo(new Uuid(userInfo.uuid));

    return {
      uuid: userInfo.uuid,
      address_uuid: userInfo.address_uuid || null,
      document: userInfo.document,
      document2: userInfo.document2 || null,
      document3: userInfo.document3 || null,
      full_name: userInfo.full_name,
      display_name: userInfo.display_name || null,
      gender: userInfo.gender || null,
      email: userInfo.email || null,
      date_of_birth: userInfo.date_of_birth,
      phone: userInfo.phone || null,
      status: userInfo.status,
      recommendation_code: userInfo.recommendation_code || null,
      marital_status: userInfo.marital_status || null,
      is_employee: userInfo.is_employee,
      user_document_validation_uuid: userInfo.user_document_validation_uuid || null,
      created_at: userInfo.created_at || null,
      updated_at: userInfo.updated_at || null,
      Employee: userInfo.Employee.map(emp => ({
        uuid: emp.uuid,
        business_info_uuid: emp.business_info_uuid,
        internal_company_code: emp.internal_company_code || null,
        salary: emp.salary || null,
        company_owner: emp.company_owner || false,
        function: emp.function || null,
        dependents_quantity: emp.dependents_quantity || 0,
        created_at: emp.created_at || null,
        updated_at: emp.updated_at || null
      })),
      is_offline_enabled: activeToken
    };
  }

}
