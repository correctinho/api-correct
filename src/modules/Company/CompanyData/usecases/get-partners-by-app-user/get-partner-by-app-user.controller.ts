import { Request, Response } from "express";
import { ICompanyDataRepository } from "../../repositories/company-data.repository";
import { GetPartnersByAppUserUsecase } from "./get-partners-by-app-user.usecase";

export class GetPartnersByAppUserController {
  constructor(
    private businessInfoRepository: ICompanyDataRepository
  ){}

  async handle(req: Request, res: Response){
    try{
      const data = req.body
      data.app_user_uuid = req.appUser.appUserId

      const usecase = new GetPartnersByAppUserUsecase(this.businessInfoRepository)

      const result = await usecase.execute(data)
      return res.json(result)

    }catch(err: any){
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
