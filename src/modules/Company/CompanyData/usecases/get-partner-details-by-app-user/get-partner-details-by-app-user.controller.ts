import { Request, Response } from "express";
import { ICompanyDataRepository } from "../../repositories/company-data.repository";
import { GetPartnerDetailsByAppUserUsecase } from "./get-partner-details-by-app-user.usecase";

export class GetPartnerDetailsByAppUserController {
  constructor(
    private businessInfoRepository: ICompanyDataRepository
  ){}

  async handle(req: Request, res: Response){
    try{
      const data = req.body

      const usecase = new GetPartnerDetailsByAppUserUsecase(this.businessInfoRepository)

      const result = await usecase.execute(data)
      return res.json(result)

    }catch(err: any){
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
