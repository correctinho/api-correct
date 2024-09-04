import { Request, Response } from "express";
import { IBusinessItemDetailsRepository } from "../../../repositories/business-item-details.repository";
import { FindAllEmployerItemDetailsBusinessAdminUsecase } from "./findAll-employer-item-details.usecase";

export class FindAllEmployerItemDetailsByBusinessAdminController {
  constructor(private itemDetailsRepository: IBusinessItemDetailsRepository) { }

  async handle(req: Request, res: Response){
    try{
      const business_info_uuid = req.companyUser.businessInfoUuid

      const usecase = new FindAllEmployerItemDetailsBusinessAdminUsecase(this.itemDetailsRepository)

      const result = await usecase.execute(business_info_uuid)

      return res.json(result)
    }catch(err: any){
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
