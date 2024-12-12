import { Request, Response } from "express";
import { ICompanyDataRepository } from "../../repositories/company-data.repository";
import { GetPartnersByBranchUsecase } from "./get-partners-by-app-branch.usecase";
import { InputGetPartnersByBranchDTO } from "./dto/get-partners-by-branch.dto";

export class GetPartnersByBranchController {
  constructor(
    private businessInfoRepository: ICompanyDataRepository
  ){}

  async handle(req: Request, res: Response){
    try{
      const data: InputGetPartnersByBranchDTO = req.body


      const usecase = new GetPartnersByBranchUsecase(this.businessInfoRepository)

      const result = await usecase.execute(data)
      return res.json(result)

    }catch(err: any){
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
