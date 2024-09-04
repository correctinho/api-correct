import { Request, Response } from "express";
import { IBusinessItemDetailsRepository } from "../../../repositories/business-item-details.repository";
import { FindAllEmployerItemDetailsUsecase } from "./findAll-employer-item-details.usecase";

export class FindAllEmployerItemDetailsController {
  constructor(private itemDetailsRepository: IBusinessItemDetailsRepository) { }

  async handle(req: Request, res: Response){
    try{
      const business_info_uuid = req.params.business_info_uuid
      const usecase = new FindAllEmployerItemDetailsUsecase(this.itemDetailsRepository)

      const result = await usecase.execute(business_info_uuid)

      return res.json(result)
    }catch(err: any){
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
