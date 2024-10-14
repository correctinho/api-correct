import { Request, Response } from "express";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { CreateCompanyUserByAdminUsecase } from "./create-company-user-by-admin.usecase";
import { CompanyUserProps } from "../../entities/company-user.entity";
import { OutputCompanyUserDTO } from "../../../../../infra/shared/middlewares/CompanyAdmin/ensure-valid-company-admin.usecase.middlware";

export class CreateCompanyUserByAdminController {
  constructor(
    private companyUserRepository: ICompanyUserRepository,

  ) { }

  async handle(req: Request, res: Response) {
    try {
      const data = req.body

      data.isAdmin = req.companyUser.isAdmin
      data.business_info_uuid = req.companyUser.businessInfoUuid
      data.adminStatus = req.companyUser.status

      const companyUserUsecase = new CreateCompanyUserByAdminUsecase(
        this.companyUserRepository
      )

      const companyUser = await companyUserUsecase.execute(data)

      return res.status(201).json(companyUser)

    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
