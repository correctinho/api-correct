import { Request, Response } from "express";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { IBusinessItemDetailsRepository } from "../../../repositories/business-item-details.repository";
import { OutputFindEmployerItemDetailsDTO } from "./dto/find-employer-item.dto";
import { FindEmployerItemDetailsUsecase } from "./find-employer-item-details.usecase";
import { IBenefitsRepository } from "../../../../../benefits/repositories/benefit.repository";

export class FindEmployerItemDetailsController {
  constructor(private itemDetailsRepository: IBusinessItemDetailsRepository, private itemsRepository: IBenefitsRepository) { }

  async handle(req: Request, res: Response){
    try{
      const businessInfoUuid = req.companyUser.businessInfoUuid

      const id = req.params.id as string
      const usecase = new FindEmployerItemDetailsUsecase(this.itemDetailsRepository, this.itemsRepository)

      const result = await usecase.execute(id, businessInfoUuid)

      return res.json(result)
    }catch(err: any){
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
