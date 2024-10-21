import { Status } from "@prisma/client";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { PasswordBcrypt } from "../../../../../crypto/password.bcrypt";
import { IPasswordCrypto } from "../../../../../crypto/password.crypto";
import { CustomError } from "../../../../../errors/custom.error";
import { CompanyUserEntity, CompanyUserProps } from "../../entities/company-user.entity";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { AdminCurrentData, InputUpdateBusinessAdminByAdminDTO, OutputUpdateBusinessAdminByAdminDTO } from "./dto/update-admin-by-admin.dto";
import { update } from "lodash";

export class UpdateAdminByAdminUsecase {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
    private passwordCrypto: IPasswordCrypto,

  ) { }

  async execute(data: InputUpdateBusinessAdminByAdminDTO, currentData: CompanyUserProps): Promise<OutputUpdateBusinessAdminByAdminDTO> {
    if (!currentData.is_admin) throw new CustomError("Unauthorized access", 403)
    if (currentData.status === "inactive") throw new CustomError("User is inactive", 403);

    const adminEntity = new CompanyUserEntity(currentData)


    if (data.password) {
      //check if new password is similar to the last one
      const comparePasswordHash = await this.passwordCrypto.compare(data.password, currentData.password)
      if (comparePasswordHash) throw new CustomError("Password must not be the same", 409);

      // data.password = passwordHash
      await adminEntity.updatePassword(data.password)
      adminEntity.changeStatus('active')

    }

    if (data.user_name) {
      //check if username already exists
      const findByUsername = await this.companyUserRepository.findByBusinessIdAndUsername(currentData.business_info_uuid.uuid, data.user_name)
      if (findByUsername) throw new CustomError("User name already registered", 409)

    }


    adminEntity.changeDocument(data.document ? data.document : currentData.document)
    adminEntity.changeUserName(data.user_name ? data.user_name : currentData.user_name)
    adminEntity.changeName(data.name ? data.name : currentData.name)
    adminEntity.changeFunction(data.function ? data.function : currentData.function)
    adminEntity.changePermissions(data.permissions ? data.permissions : currentData.permissions)

    //update user
    const updateUser = await this.companyUserRepository.updateUser(adminEntity)
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
