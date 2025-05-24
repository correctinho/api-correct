
import { ICorrectAdminAccountRepository } from "../../repositories/correct-admin-account.repository";
import { GetCorrectAdminAccountUsecase } from "./get-correct-admin-account.usecase";
import { Request, Response } from "express";

export class GetCorrectAdminAccountController {
  constructor(
    private correctAdminAccount: ICorrectAdminAccountRepository
  ) { }

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body;

      data.isAdmin = req.correctAdmin.isAdmin;
      const usecase = new GetCorrectAdminAccountUsecase(this.correctAdminAccount);
      const result = await usecase.execute(data);
      return res.status(200).json(result);
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      return res.status(statusCode).json({
        error: err.message || "Internal Server Error",
      });
    }
  }
}
