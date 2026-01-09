// src/modules/Company/CompanyUser/useCases/ForgotPassword/SendCompanyForgotPasswordMailController.ts
import { Request, Response } from "express";
import { ICompanyUserRepository } from "../../../repositories/company-user.repository";
import { IMailProvider } from "../../../../../../infra/providers/MailProvider/models/IMailProvider";
import { SendCompanyForgotPasswordMailUsecase } from "./send-forget-password-email.usecase";

export class SendCompanyForgotPasswordMailController {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
    private mailProvider: IMailProvider
  ) {}

  async handle(req: Request, res: Response) {
    try {
      const { email, portal } = req.body;

      const useCase = new SendCompanyForgotPasswordMailUsecase(
        this.companyUserRepository,
        this.mailProvider
      );

      await useCase.execute({ email, portal });

      // Retornamos 204 (No Content) ou 200. 
      // Por segurança, sempre dizemos que "se o email existir, enviamos".
      return res.status(200).json({ message: "Se o e-mail estiver cadastrado, você receberá o link de recuperação." });

    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        error: err.message || "Erro inesperado."
      });
    }
  }
}

