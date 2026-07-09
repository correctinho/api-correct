import { Request, Response } from "express";
import { IBusinessFirstRegisterRepository } from "../../repositories/business-first-register.repository";
import { CreateBusinessRegisterSelfServiceUsecase } from "./business-first-register-self-service.usecase";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { IBranchRepository } from "../../../../branch/repositories/branch.repository";

export class CreateBusinessRegisterSelfServiceController {
  constructor(
    private businessRegisterRepository: IBusinessFirstRegisterRepository,
    private companyDataRepository: ICompanyDataRepository,
    private branchRepository: IBranchRepository,
  ) { }

  async handle(req: Request, res: Response) {
    try {
      const data = req.body

      const businessRegisterSelfServiceUsecase = new CreateBusinessRegisterSelfServiceUsecase(
        this.businessRegisterRepository,
        this.companyDataRepository,
        this.branchRepository,
      )

      const result = await businessRegisterSelfServiceUsecase.execute(data)
      return res.status(201).json(result)

    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        error: err.message
      })
    }
  }
}
