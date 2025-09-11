import { Request, Response } from "express";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { IPartnerConfigRepository } from "../../../../Company/PartnerConfig/repositories/partner-config.repository";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { ProcessPaymentByAppUserUsecase } from "./process-payment-by-app-user.usecase";
import { IAppUserAuthRepository } from "../../../../AppUser/AppUserManagement/repositories/app-use-auth-repository";
import { IPasswordCrypto } from "../../../../../crypto/password.crypto";

export class ProcessPaymentByAppUserController {
  constructor(
    private transactionOrderRepository: ITransactionOrderRepository,
    private userItemRepository: IAppUserItemRepository,
    private partnerConfigRepository: IPartnerConfigRepository,
    private readonly hashService: IPasswordCrypto

  ) { }

  async handle(req: Request, res: Response) {
    try {
      const data = req.body;
      data.existing_pin = req.appUser.transaction_pin
      data.appUserInfoID = req.appUser.user_info_uuid;

      const usecase = new ProcessPaymentByAppUserUsecase(
        this.transactionOrderRepository,
        this.userItemRepository,
        this.partnerConfigRepository,
        this.hashService
      );

      const result = await usecase.execute(data);
      return res.status(200).json(result);
    } catch (err: any) {
      const statusCode = err.statusCode || 500; // Default para 500 se não houver statusCode
      return res.status(statusCode).json({
        error: err.message || "Internal Server Error", // Mensagem padrão
      });
    }
  }
}
