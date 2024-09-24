import { Request, Response } from "express";
import { CreateEmployerItemByCorrectUsecase } from "./create-employer-item-by-correct.usecase";
import { IBusinessItemDetailsRepository } from "../../../repositories/business-item-details.repository";
import { IBenefitsRepository } from "../../../../../benefits/repositories/benefit.repository";
import { ICompanyDataRepository } from "../../../../CompanyData/repositories/company-data.repository";

export class CreateEmployerItemByCorrectController {
  constructor(
    private itemDetailsRepository: IBusinessItemDetailsRepository,
    private benefitsRepository: IBenefitsRepository,
    private businessRepository: ICompanyDataRepository
  ) { }

  async handle(req: Request, res: Response){
    try{
      const data =  req.body
      const usecase = new CreateEmployerItemByCorrectUsecase(
        this.itemDetailsRepository,
        this.benefitsRepository,
        this.businessRepository
      )

      const result = await usecase.execute(data)

      return res.status(201).json(result)
    }catch(err: any){
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
