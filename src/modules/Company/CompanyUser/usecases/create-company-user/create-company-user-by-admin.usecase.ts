import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { OutputCompanyUserDTO } from "../../../../../infra/shared/middlewares/CompanyAdmin/ensure-valid-company-admin.usecase.middlware";
import { CompanyUserEntity, CompanyUserProps } from "../../entities/company-user.entity";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { InputCreateCompanyUserEntityDTO } from "./dto/create-company-user-entity.dto";

export class CreateCompanyUserByAdminUsecase {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
  ) { }

  async execute(data: InputCreateCompanyUserEntityDTO) {
    //check if it's admin creating a new user
    if (!data.isAdmin) throw new CustomError("Only admin is able to create new user", 403)
    //check if admin is active
    if (data.adminStatus !== 'active') throw new CustomError("Admin is not allowed to create users", 403)

    const userDataEntity = {
      business_info_uuid: data.business_info_uuid ? new Uuid(data.business_info_uuid) : null,
      email: data.email ? data.email : null,
      document: data.document ? data.document : null,
      name: data.name ? data.name : null,
      is_admin: data.is_admin,
      permissions: data.permissions,
      user_name: data.user_name ? data.user_name : null,
      password: data.password ? data.password : null,
      function: data.function ? data.function : null,
      status: data.status,

    }

    const userEntity = await CompanyUserEntity.create(userDataEntity)

    if (!userEntity.user_name) throw new CustomError("User name is required", 400)

    //check if username already exists
    const findByUsername = await this.companyUserRepository.findByBusinessIdAndUsername(userEntity.business_info_uuid.uuid, userEntity.user_name)
    if (findByUsername) throw new CustomError("User name already registered", 409)

    //set user is non admin and active status
    userEntity.changeIsAdmin(false)
    userEntity.changeStatus('active')


    //by default, permissios is 'all'. So user must not have this property.
    if (userEntity.permissions.includes('all')) throw new CustomError("Please, select a permission type", 400)

    const user = await this.companyUserRepository.saveUser(userEntity)

    return {
      uuid: user.uuid.uuid,
      business_info_uuid: user.business_info_uuid.uuid,
      email: user.email,
      document: user.document,
      name: user.name,
      is_admin: user.is_admin,
      permissions: user.permissions,
      user_name: user.user_name,
      function: user.function,
      status: user.status,
      admin: {
        isAdmin: data.isAdmin,
        status: data.adminStatus
      }
    }
  }
}
