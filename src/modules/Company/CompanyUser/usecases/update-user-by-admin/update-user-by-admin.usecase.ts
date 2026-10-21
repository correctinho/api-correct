import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { PasswordBcrypt } from "../../../../../crypto/password.bcrypt";
import { IPasswordCrypto } from "../../../../../crypto/password.crypto";
import { CustomError } from "../../../../../errors/custom.error";
import { CompanyUserEntity } from "../../entities/company-user.entity";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { InputUpdateBusinessUserByAdminDTO } from "./dto/update-user-by-admin.dto";
import { z } from "zod";

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
      if (findByUsername && findByUsername.uuid.uuid !== findUser.uuid.uuid) throw new CustomError("User name already registered", 409)
    }

    if (data.document !== undefined) {
      const cleanDoc = data.document && data.document.trim() !== "" ? data.document.trim() : null;
      userEntity.changeDocument(cleanDoc);
    }

    if (data.email !== undefined) {
      const cleanEmail = data.email && data.email.trim() !== "" ? data.email.trim().toLowerCase() : null;
      if (cleanEmail) {
        const emailValidation = z.string().email().safeParse(cleanEmail);
        if (!emailValidation.success) throw new CustomError("Formato de e-mail inválido.", 400);
        const findByEmail = await this.companyUserRepository.findByEmail(cleanEmail);
        if (findByEmail && findByEmail.uuid.uuid !== findUser.uuid.uuid) {
          throw new CustomError("Este e-mail já está em uso por outro usuário.", 409);
        }
      }
      userEntity.changeEmail(cleanEmail);
    }

    if (data.user_name !== undefined) userEntity.changeUserName(data.user_name);
    if (data.name !== undefined) userEntity.changeName(data.name);
    if (data.function !== undefined) userEntity.changeFunction(data.function);
    if (data.permissions !== undefined) userEntity.changePermissions(data.permissions);
    if (data.status !== undefined) userEntity.changeStatus(data.status);

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
