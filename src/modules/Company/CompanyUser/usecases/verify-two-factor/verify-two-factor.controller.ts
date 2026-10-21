import { Request, Response } from "express";
import { VerifyTwoFactorUsecase } from "./verify-two-factor.usecase";

export class VerifyTwoFactorController {
  constructor(private verifyTwoFactorUsecase: VerifyTwoFactorUsecase) {}

  async handle(req: Request, res: Response) {
    try {
      const { temp_token, code } = req.body;
      const result = await this.verifyTwoFactorUsecase.execute({ temp_token, code });
      return res.status(200).json(result);
    } catch (err: any) {
      console.log("[VerifyTwoFactorController] Erro:", err.message);
      return res.status(err.statusCode || 500).json({
        error: err.message || "Erro ao verificar código de autenticação."
      });
    }
  }
}
