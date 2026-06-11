import { ICompanyUserRepository } from "../../../../modules/Company/CompanyUser/repositories/company-user.repository";
import { CustomError } from "../../../../errors/custom.error";

export type OutputCompanyUserDTO = {
  uuid: string,
  businessInfoUuid: string,
  password: string
  isAdmin: boolean,
  document: string | null,
  name: string | null,
  email: string | null,
  userName: string | null,
  function: string | null,
  permissions: string[],
  status: string,
  fantasy_name: string | null,
  created_at: string,
  updated_at: string

}
export class EnsureValidCompanyUserUsecase {
    constructor(
        private companyUserRepository: ICompanyUserRepository
    ) { }
    async execute(id: string): Promise<OutputCompanyUserDTO> {
        const user = await this.companyUserRepository.findById(id)
        if (!user) throw new CustomError("Acesso negado", 401)

        if(user.status === 'inactive') throw new CustomError("Acesso negado", 401)

        return {
          uuid: user.uuid.uuid,
          businessInfoUuid: user.business_info_uuid.uuid,
          password: user.password,
          isAdmin: user.is_admin,
          document: user.document,
          name: user.name,
          email: user.email,
          userName: user.user_name,
          function: user.function,
          permissions: user.permissions,
          status: user.status,
          fantasy_name: user.fantasy_name,
          created_at: user.created_at,
          updated_at: user.updated_at

        }
    }
}
