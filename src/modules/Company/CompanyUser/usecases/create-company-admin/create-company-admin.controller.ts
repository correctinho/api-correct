import { Request, Response } from "express";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { CreateCompanyAdminUseCase } from "./create-company-admin.usecase";
import { CompanyUserProps } from "../../entities/company-user.entity";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { InputCreateCompanyAdminDTO } from "./dto/create-company-admin.dto";

export class CreateCompanyUserByCorrectController {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
    private companyDataRepository: ICompanyDataRepository

  ) { }

  async handle(req: Request, res: Response) {
    try {
      const data: InputCreateCompanyAdminDTO = req.body
      const companyUserUsecase = new CreateCompanyAdminUseCase(
        this.companyUserRepository,
        this.companyDataRepository
      )

      const result = await companyUserUsecase.execute(data)

      return res.status(201).json(result)

    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
