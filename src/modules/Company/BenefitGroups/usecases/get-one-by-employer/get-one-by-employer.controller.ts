import { Request, Response } from "express";
import { IBenefitGroupsRepository } from "../../repositories/benefit-groups.repository";
import { GetOneBenefitGroupsByEmployerUsecase } from "./get-one-by-employer.usecase";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { IBusinessItemDetailsRepository } from "../../../BusinessItemsDetails/repositories/business-item-details.repository";

export class GetOneBenefitGroupsByEmployerController {
  constructor(
    private benefitGroupsRepository: IBenefitGroupsRepository,


  ) { }

  async handle(req: Request, res: Response) {
    try {

      const uuid = req.query.uuid as string
      const business_info_uuid = req.companyUser.businessInfoUuid

      const usecase = new GetOneBenefitGroupsByEmployerUsecase(
        this.benefitGroupsRepository,
      )

      const result = await usecase.execute(uuid, business_info_uuid)

      return res.json(result)
    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
