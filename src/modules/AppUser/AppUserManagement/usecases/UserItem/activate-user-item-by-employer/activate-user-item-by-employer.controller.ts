import { Request, Response } from "express";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { ActivateUserItemByEmployerUsecase } from "./activate-user-item-by-employer.usecase";
import { IBenefitGroupsRepository } from "../../../../../Company/BenefitGroups/repositories/benefit-groups.repository";

export class ActivateUserItemByEmployerController {
  constructor(
    private appUserItemRepository: IAppUserItemRepository,
    private groupsRepository: IBenefitGroupsRepository
  ) { }

  async handle(req: Request, res: Response) {
    try{
      const data = req.body
      data.business_info_uuid = req.companyUser.businessInfoUuid

      const usecase = new ActivateUserItemByEmployerUsecase(this.appUserItemRepository, this.groupsRepository)

      const result = await usecase.execute(data)

      return res.json(result)
    }catch(err: any){
      return res.status(err.statusCode).json({
        error: err.message,
    });
    }
  }

}
