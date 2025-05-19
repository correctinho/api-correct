import { IBusinessAccountRepository } from "../../../repositories/business-account.repository";
import { GetBusinessAccountByAdminUseCase } from "./get-business-account-by-admin.usecase";
import { Request, Response } from "express";

export class GetBusinessAccountByAdminController {
  constructor(
    private businessAccount: IBusinessAccountRepository
  ) { }

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body;
      data.business_info_uuid = req.companyUser.businessInfoUuid
      const usecase = new GetBusinessAccountByAdminUseCase(this.businessAccount);
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
