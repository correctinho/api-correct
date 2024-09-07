import { Request, Response } from "express";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { CreateCompanyUserByAdminUsecase } from "./create-company-user-by-admin.usecase";
import { CompanyUserProps } from "../../entities/company-user.entity";
import { logger } from "../../../../../utils/logger";
import { OutputAdminDetailDTO } from "../../../../../infra/shared/middlewares/CorrectAdmin/ensure-valid-correct-admin.usecase.middlware";
import { OutputCompanyUserDTO } from "../../../../../infra/shared/middlewares/CompanyAdmin/ensure-valid-company-admin.usecase.middlware";

export class CreateCompanyUserByAdminController {
  constructor(
    private companyUserRepository: ICompanyUserRepository,

  ) { }

  async handle(req: Request, res: Response) {
    try {
      const data: CompanyUserProps = req.body

      const businessAdmin: OutputCompanyUserDTO = {
        uuid: req.companyUser.companyUserId,
        businessInfoUuid: req.companyUser.businessInfoUuid,
        isAdmin: req.companyUser.isAdmin,
        document: req.companyUser.document,
        name: req.companyUser.name,
        email: req.companyUser.email,
        userName: req.companyUser.userName,
        function: req.companyUser.function,
        permissions: req.companyUser.permissions,
        status: req.companyUser.status,
        created_at: req.companyUser.created_at,
        updated_at: req.companyUser.updated_at
      }

      const companyUserUsecase = new CreateCompanyUserByAdminUsecase(
        this.companyUserRepository
      )

      const companyUser = await companyUserUsecase.execute(data, businessAdmin)

      return res.status(201).json(companyUser)

    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
