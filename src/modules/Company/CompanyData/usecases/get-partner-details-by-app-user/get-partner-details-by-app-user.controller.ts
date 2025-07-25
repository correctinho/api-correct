import { Request, Response } from "express";
import { ICompanyDataRepository } from "../../repositories/company-data.repository";
import { GetPartnerDetailsByAppUserUsecase } from "./get-partner-details-by-app-user.usecase";

export class GetPartnerDetailsByAppUserController {
  constructor(
    private businessInfoRepository: ICompanyDataRepository
  ){}

  async handle(req: Request, res: Response){
    try{
      const businessInfoUuid = req.query.business_info_uuid as string

      const usecase = new GetPartnerDetailsByAppUserUsecase(this.businessInfoRepository)

      const result = await usecase.execute(businessInfoUuid)
      return res.json(result)

    }catch(err: any){
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
