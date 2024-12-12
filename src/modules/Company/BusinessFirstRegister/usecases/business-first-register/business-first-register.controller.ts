import { Request, Response } from "express";
import { IBusinessFirstRegisterRepository } from "../../repositories/business-first-register.repository";
import { CreateBusinessRegisterUsecase } from "./business-first-register.usecase";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { IBranchRepository } from "../../../../branch/repositories/branch.repository";
import { IBenefitsRepository } from "../../../../benefits/repositories/benefit.repository";

export class CreateBusinessRegisterController {
  constructor(
    private businessRegisterRepository: IBusinessFirstRegisterRepository,
    private companyDataRepository: ICompanyDataRepository,
    private branchRepository: IBranchRepository,
    private itemRepository: IBenefitsRepository
  ) { }

  async handle(req: Request, res: Response) {
    try {
      const data = req.body

      if(req?.correctAdmin) data.correct_user_uuid = req.correctAdmin.correctAdminId

      const businessRegisterUsecase = new CreateBusinessRegisterUsecase(
        this.businessRegisterRepository,
        this.companyDataRepository, this.branchRepository,
        this.itemRepository
      )

      const result = await businessRegisterUsecase.execute(data)
      return res.status(201).json(result)

    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
