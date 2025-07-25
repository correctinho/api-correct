import { Request, Response } from "express";
import { IPartnerConfigRepository } from "../../repositories/partner-config.repository";
import { FilterPartnersByAppUserUsecase } from "./filter-partners-by-appuser.usecase";
export class FilterPartnersByAppUserController {
  constructor(
    private partnerConfigRepository: IPartnerConfigRepository
  ) { }
  async handle(req: Request, res: Response) {
    try {

      const data = req.body
      data.page = req.query.page ? parseInt(req.query.page as string) : 1
      data.branch_uuid = req.query.branch_uuid as string
      data.city = req.query.city as string
      data.search = req.query.search as string
      data.item_uuid = req.query.item_uuid as string
      data.partner_category = req.query.partner_category as string
      const usecase = new FilterPartnersByAppUserUsecase(this.partnerConfigRepository)
      const result = await usecase.execute(data)

      return res.json(result)
    } catch (err: any) {
      console.log({err})
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
