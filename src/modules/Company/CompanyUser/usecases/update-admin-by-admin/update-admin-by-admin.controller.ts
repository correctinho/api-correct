import { Request, Response } from "express";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { UpdateAdminByAdminUsecase } from "./update-admin-by-admin.usecase";
import { IPasswordCrypto } from "../../../../../crypto/password.crypto";
import { InputUpdateBusinessAdminByAdminDTO } from "./dto/update-admin-by-admin.dto";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { Permissions, Status } from "@prisma/client";
import { CompanyUserEntity, CompanyUserProps } from "../../entities/company-user.entity";

export class UpdateAdminByAdminController {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
    private passwordCrypto: IPasswordCrypto,

  ) { }

  async handle(req: Request, res: Response) {

    try {
      const data: InputUpdateBusinessAdminByAdminDTO = req.body

      let currentData: CompanyUserProps = {
        uuid: new Uuid(req.companyUser.companyUserId),
        business_info_uuid: new Uuid(req.companyUser.businessInfoUuid),
        is_admin: req.companyUser.isAdmin,
        document: req.companyUser.document,
        email: req.companyUser.email,
        name: req.companyUser.name,
        user_name: req.companyUser.userName,
        password: req.companyUser.password,
        function: req.companyUser.function,
        permissions: req.companyUser.permissions as Permissions[],
        status: req.companyUser.status as Status
      }


      const updateUserUsecase = new UpdateAdminByAdminUsecase(this.companyUserRepository, this.passwordCrypto)

      const updateUser = await updateUserUsecase.execute(data, currentData)

      return res.json(updateUser)

    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
