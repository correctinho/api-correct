import { CustomError } from "../../../../../errors/custom.error";
import { OutputCompanyUserDTO } from "../../../../../infra/shared/middlewares/CompanyAdmin/ensure-valid-company-admin.usecase.middlware";
import { CompanyUserEntity, CompanyUserProps } from "../../entities/company-user.entity";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";

export class CreateCompanyUserByAdminUsecase {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
  ) { }

  async execute(data: CompanyUserProps, businessAdmin: OutputCompanyUserDTO) {

    //check if admin is active
    if (businessAdmin.status !== 'active') throw new CustomError("Admin is not allowed to create users", 403)

    //check if it admin creating a new user
    if(!businessAdmin.isAdmin) throw new CustomError("Only admin is able to create new user", 403)

    if (!data.user_name) throw new CustomError("User name is required", 400)

    //check if username already exists
    const findByUsername = await this.companyUserRepository.findByBusinessIdAndUsername(businessAdmin.businessInfoUuid, data.user_name)
    if (findByUsername) throw new CustomError("User name already registered", 409)

    //if admin is found, set same business info id to users
    data.business_info_uuid = businessAdmin.businessInfoUuid
    data.status = businessAdmin.status
    //by default user is not admin, so there is no need to set data.is_admin = false

    //by default, permissios is 'all'. So user must not have this property.
    if (data.permissions.includes('all')) throw new CustomError("Please, select a permission type", 400)

    const user = await CompanyUserEntity.create(data)

    await this.companyUserRepository.saveUser(user)

    return {
      uuid: user.uuid,
      business_info_uuid: user.business_info_uuid,
      email: user.email,
      document: user.document,
      name: user.name,
      is_admin: user.is_admin,
      permissions: user.permissions,
      user_name: user.user_name,
      function: user.function,
      status: user.status
    }  }
}
