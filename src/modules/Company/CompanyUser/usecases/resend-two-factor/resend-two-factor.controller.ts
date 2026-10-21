import { Request, Response } from "express";
import { ResendTwoFactorUsecase } from "./resend-two-factor.usecase";

export class ResendTwoFactorController {
  constructor(private resendTwoFactorUsecase: ResendTwoFactorUsecase) {}

  async handle(req: Request, res: Response) {
    try {
      const { temp_token } = req.body;
      const result = await this.resendTwoFactorUsecase.execute({ temp_token });
      return res.status(200).json(result);
    } catch (err: any) {
      console.log("[ResendTwoFactorController] Erro:", err.message);
      return res.status(err.statusCode || 500).json({
        error: err.message || "Erro ao reenviar código de autenticação."
      });
    }
  }
}
