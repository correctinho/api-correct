import { Request, Response } from "express";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { UpdateUserByAdminUsecase } from "./update-user-by-admin.usecase";
import { IPasswordCrypto } from "../../../../../crypto/password.crypto";

export class UpdateUserbyAdminController {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
    private passwordCrypto: IPasswordCrypto,

  ) { }

  async handle(req: Request, res: Response) {

    try {
      const data = req.body
      data.uuid = req.query.user_id as string

      data.isAdmin = req.companyUser.isAdmin
      data.business_info_uuid = req.companyUser.businessInfoUuid

      const updateUserUsecase = new UpdateUserByAdminUsecase(this.companyUserRepository, this.passwordCrypto)

      const updateUser = await updateUserUsecase.execute(data)

      return res.json(updateUser)

    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }



  }
}
