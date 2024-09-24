import { Request, Response } from "express";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { FindAllUserItemsByEmployerUsecase } from "./find-all-by-employer.usecase";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
export class  FindAllUserItemsByEmployeryController {
  constructor(
    private appUserItemRepository: IAppUserItemRepository,
    private appUserInfoRepository: IAppUserInfoRepository

  ) { }

  async handle(req: Request, res: Response) {
    try {
      const userInfoUuid = req.query.userInfoUuid as string
      const businessInfoUuid = req.companyUser.businessInfoUuid

      const usecase = new FindAllUserItemsByEmployerUsecase(this.appUserItemRepository, this.appUserInfoRepository)

      const result = await usecase.execute(userInfoUuid, businessInfoUuid)

      return res.json(result)
    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
