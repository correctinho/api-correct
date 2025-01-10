import { Request, Response } from "express";
import { GetPartnersByCategoryUsecase } from "./get-partners-by-category.usecase";
import { IPartnerConfigRepository } from "../../repositories/partner-config.repository";
export class GetPartnersByCategoryController {
  constructor(
    private partnerConfigRepository: IPartnerConfigRepository
  ) { }
  async handle(req: Request, res: Response) {
    try {

      const data = req.body
      data.partner_category = req.query.partner_category as string
      const usecase = new GetPartnersByCategoryUsecase(this.partnerConfigRepository)
      const result = await usecase.execute(data)

      return res.json(result)
    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
