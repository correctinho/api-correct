import { Request, Response } from "express";
import { IBenefitGroupsRepository } from "../../repositories/benefit-groups.repository";
import { GetAllBenefitGroupsByEmployerUsecase } from "./get-all-by-employer.usecase";

export class GetAllBenefitGroupsByEmployerController {
  constructor(
    private benefitGroupsRepository: IBenefitGroupsRepository,
  ) { }

  async handle(req: Request, res: Response) {
    try {

      const business_info_uuid = req.companyUser.businessInfoUuid


      const usecase = new GetAllBenefitGroupsByEmployerUsecase(this.benefitGroupsRepository)

      const result = await usecase.execute(business_info_uuid)

      return res.json(result)
    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
