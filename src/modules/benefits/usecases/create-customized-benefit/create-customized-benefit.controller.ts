import { Request, Response } from "express";
import { ICompanyDataRepository } from "../../../Company/CompanyData/repositories/company-data.repository";
import { IBenefitsRepository } from "../../repositories/benefit.repository";
import { CreateCustomizedBenefitUsecase } from "./create-customized-benefit.usecase";

export class CreateCustomizedBenefitController {
  constructor(
    private benefitsRepository: IBenefitsRepository,
    private businessInfoRepository: ICompanyDataRepository
  ) { }

  async handle(req: Request, res: Response) {
    try {
      const data = req.body
      const usecase = new CreateCustomizedBenefitUsecase(this.benefitsRepository, this.businessInfoRepository)

      const result = await usecase.execute(data)

      return res.status(201).json(result)
    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      });
    }
  }
}
