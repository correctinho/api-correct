import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { PasswordBcrypt } from "../../../../../crypto/password.bcrypt";
import { IPasswordCrypto } from "../../../../../crypto/password.crypto";
import { CustomError } from "../../../../../errors/custom.error";
import { CompanyUserEntity } from "../../entities/company-user.entity";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { InputUpdateBusinessUserByAdminDTO } from "./dto/update-user-by-admin.dto";

export class UpdateUserByAdminUsecase {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
    private passwordCrypto: IPasswordCrypto,

  ) { }

  async execute(data: InputUpdateBusinessUserByAdminDTO) {
    if (!data.uuid) throw new CustomError("User ID is required", 400)

    //check if user exists
    const findUser = await this.companyUserRepository.findByIdAuth(data.uuid)
    if (!findUser) throw new CustomError("User not found", 404)


    if (findUser.business_info_uuid.uuid !== data.business_info_uuid) throw new CustomError("Unauthorized: ", 403);

    const userEntity = new CompanyUserEntity(findUser)

    if (data.password) {
      await userEntity.updatePassword(data.password)

    }

    if (data.user_name) {
      //check if username already exists
      const findByUsername = await this.companyUserRepository.findByBusinessIdAndUsername(findUser.business_info_uuid.uuid, data.user_name)
      if (findByUsername && findByUsername.uuid !== findUser.uuid) throw new CustomError("User name already registered", 409)

    }
    userEntity.changeDocument(data.document)
    userEntity.changeUserName(data.user_name)
    userEntity.changeName(data.name)
    userEntity.changeEmail(data.email)
    userEntity.changeFunction(data.function)
    userEntity.changePermissions(data.permissions)
    userEntity.changeStatus(data.status)
    //update user
    const updateUser = await this.companyUserRepository.updateUser(userEntity)

    return {
      uuid: updateUser.uuid.uuid,
      business_info_uuid: updateUser.business_info_uuid.uuid,
      is_admin: updateUser.is_admin,
      document: updateUser.document,
      name: updateUser.name,
      email: updateUser.email,
      user_name: updateUser.user_name,
      function: updateUser.function,
      status: updateUser.status,
      permissions: updateUser.permissions,
      created_at: updateUser.created_at,
      updated_at: updateUser.updated_at
    }
  }
}
