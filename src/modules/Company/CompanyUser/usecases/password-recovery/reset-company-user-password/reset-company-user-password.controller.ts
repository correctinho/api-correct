import { ICompanyUserRepository } from "../../../repositories/company-user.repository";
import { Request, Response } from "express";
import { ResetCompanyPasswordUsecase } from "./reset-company-user-password.usecase";

export class ResetCompanyPasswordController {
  constructor(
    private companyUserRepository: ICompanyUserRepository
  ) {}

  async handle(req: Request, res: Response) {
    try {
      const { newPassword } = req.body;
      const { token } = req.query as { token: string };
      const useCase = new ResetCompanyPasswordUsecase(
        this.companyUserRepository
      );

      await useCase.execute({ token, newPassword });

      return res.status(200).json({ message: "Senha alterada com sucesso." });

    } catch (err: any) {
      return res.status(err.statusCode || 400).json({
        error: err.message
      });
    }
  }
}