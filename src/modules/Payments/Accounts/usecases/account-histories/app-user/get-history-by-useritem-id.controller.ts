import { Request, Response } from "express";
import { GetAppUserHistoryByAccountIdUsecase } from "./get-history-by-userItem-id.uscase";
import { IAccountsHistoryRepository } from "../../repositories/accounts-history.repository";

export class GetAppUserHistoryByAccountIdController {
  constructor(
    private accountHistoryRepository: IAccountsHistoryRepository,
  ) {
  }
  async handle(req: Request, res: Response) {
    try {
      const data = req.body
      data.user_info_uuid = req.appUser.user_info_uuid
      data.user_item_uuid = req.query.user_item_uuid as string
      data.year = req.query.year ? parseInt(req.query.year as string) : undefined;
      data.month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const usecase = new GetAppUserHistoryByAccountIdUsecase(this.accountHistoryRepository)

      const result = await usecase.execute(data)

      return res.json(result)

    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      return res.status(statusCode).json({
        error: err.message || "Internal Server Error",
      });
    }
  }
}
