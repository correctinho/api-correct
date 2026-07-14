import { Request, Response } from "express";
import { IBusinessFirstRegisterRepository } from "../../repositories/business-first-register.repository";
import { CreateBusinessRegisterSelfServiceUsecase } from "./business-first-register-self-service.usecase";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { IBranchRepository } from "../../../../branch/repositories/branch.repository";
import { IMailProvider } from "../../../../../infra/providers/MailProvider/models/IMailProvider";

export class CreateBusinessRegisterSelfServiceController {
  constructor(
    private businessRegisterRepository: IBusinessFirstRegisterRepository,
    private companyDataRepository: ICompanyDataRepository,
    private branchRepository: IBranchRepository,
    private mailProvider: IMailProvider
  ) { }

  async handle(req: Request, res: Response) {
    try {
      const data = req.body

      const businessRegisterSelfServiceUsecase = new CreateBusinessRegisterSelfServiceUsecase(
        this.businessRegisterRepository,
        this.companyDataRepository,
        this.branchRepository,
        this.mailProvider
      )

      const result = await businessRegisterSelfServiceUsecase.execute(data)
      return res.status(201).json(result)

    } catch (err: any) {
      console.log(err)
      return res.status(err.statusCode || 500).json({
        error: err.message
      })
    }
  }
}
