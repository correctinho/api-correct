import { Request, Response } from "express";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { FindUserItemByIdUsecase } from './find-user-item-by-id.usecase'
export class FindUserItemByIdByController {
  constructor(
    private appUserItemRepository: IAppUserItemRepository
  ) { }

  async handle(req: Request, res: Response) {
    try {
      const userItemId = req.query.userItemId as string

      const usecase = new FindUserItemByIdUsecase(this.appUserItemRepository)

      const result = await usecase.execute(userItemId)

      return res.json(result)
    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
