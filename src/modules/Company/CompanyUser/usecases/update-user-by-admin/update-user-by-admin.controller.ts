import { Request, Response } from "express";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { CompanyUserEntity } from "../../entities/company-user.entity";
import { logger } from "../../../../../utils/logger";
import { UpdateUserByAdminUsecase } from "./update-user-by-admin.usecase";
import { IPasswordCrypto } from "../../../../../crypto/password.crypto";

export class UpdateUserbyAdminController {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
    private passwordCrypto: IPasswordCrypto,

  ) { }

  async handle(req: Request, res: Response) {

    try {
      const data: CompanyUserEntity = req.body
      data.uuid = req.query.user_id as string

      const businessAdminUuid = req.companyUser.companyUserId
      const businessInfoUuid = req.companyUser.businessInfoUuid
      const updateUserUsecase = new UpdateUserByAdminUsecase(this.companyUserRepository, this.passwordCrypto)

      const updateUser = await updateUserUsecase.execute(data, businessAdminUuid, businessInfoUuid)

      return res.json(updateUser)

    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }



  }
}
