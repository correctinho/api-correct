import { Request, Response } from "express";
import { CreatePartnerConfigUsecase } from "./create-partner-config.usecase";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { IBranchRepository } from "../../../../branch/repositories/branch.repository";
import { IPartnerConfigRepository } from "../../repositories/partner-config.repository";

export class CreatePartnerConfigController {
  constructor(
    private businessInfoRepository: ICompanyDataRepository,
    private branchInfoRepository: IBranchRepository,
    private partnerConfigRepository: IPartnerConfigRepository
  ){}

  async handle(req: Request, res: Response){
    try {
      const data = req.body

      const usecase = new CreatePartnerConfigUsecase(
        this.businessInfoRepository,
        this.branchInfoRepository,
        this.partnerConfigRepository
      )

      const result = await usecase.execute(data)

      return res.status(201).json(result)
    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })

    }
  }
}
