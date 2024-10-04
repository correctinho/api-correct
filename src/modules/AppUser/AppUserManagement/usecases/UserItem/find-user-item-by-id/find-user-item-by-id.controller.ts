import { Request, Response } from "express";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { FindUserItemByIdUsecase } from './find-user-item-by-id.usecase'
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { ICompanyDataRepository } from "../../../../../Company/CompanyData/repositories/company-data.repository";
export class FindUserItemByIdByController {
  constructor(
    private appUserItemRepository: IAppUserItemRepository,
    private appUserInfoRepository: IAppUserInfoRepository,
  ) { }

  async handle(req: Request, res: Response) {
    try {
      const userItemId = req.query.userItemId as string
      let business_user_business_info_uuid: string | undefined
      let user_info_uuid: string | undefined

      if(req.companyUser) {
        business_user_business_info_uuid = req?.companyUser.businessInfoUuid
      }

      if(req.appUser) {
        user_info_uuid = req.appUser.user_info_uuid
      }
      const usecase = new FindUserItemByIdUsecase(this.appUserItemRepository, this.appUserInfoRepository)

      const result = await usecase.execute(userItemId, business_user_business_info_uuid, user_info_uuid)

      return res.json(result)
    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
