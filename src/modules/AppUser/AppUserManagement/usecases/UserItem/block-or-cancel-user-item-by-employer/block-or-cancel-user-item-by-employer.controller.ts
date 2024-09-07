import { Request, Response } from "express";
import { IBenefitsRepository } from "../../../../../benefits/repositories/benefit.repository";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { InputBlockOrCancelUserItemByEmployer } from "./dto/block-or-cancel.dto";
import { BlockOrCanceluserItemByEmployerUsecase } from "./block-or-cancel-user-item-by-employer.usecase";

export class BlockOrCanceluserItemByEmployerController {
  constructor(
    private appUserItemRepository: IAppUserItemRepository,
    private itemRepository: IBenefitsRepository
  ) { }

  async handle(req: Request, res: Response) {
    try{
      const data: InputBlockOrCancelUserItemByEmployer = req.body
      data.business_info_uuid = req.companyUser.businessInfoUuid

      const usecase = new BlockOrCanceluserItemByEmployerUsecase(this.appUserItemRepository, this.itemRepository)

      const result = await usecase.execute(data)

      return res.json(result)
    }catch(err: any){
      return res.status(err.statusCode).json({
        error: err.message,
    });
    }
  }

}
