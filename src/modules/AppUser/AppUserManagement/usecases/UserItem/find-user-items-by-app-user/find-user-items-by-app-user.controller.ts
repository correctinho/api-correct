import { Request, Response } from "express";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { FindAllUserItemsByAppUserUsecase } from "./find-user-items-by-app-user.usecase";
import { ICompanyDataRepository } from "../../../../../Company/CompanyData/repositories/company-data.repository";

export class  FindAllUserItemsByAppUserController {
  constructor(
    private appUserItemRepository: IAppUserItemRepository,
    private appUserInfoRepository: IAppUserInfoRepository,


  ) { }

  async handle(req: Request, res: Response) {
    try {
      const userInfoUuid = req.appUser.user_info_uuid

      const usecase = new FindAllUserItemsByAppUserUsecase(this.appUserItemRepository, this.appUserInfoRepository)

      const result = await usecase.execute(userInfoUuid)

      return res.json(result)
    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
