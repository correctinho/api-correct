import { Request, Response } from "express";
import { ICorrectAdminRepository } from "../../repositories/correct-admin.repository";
import { IPasswordCrypto } from "../../../../crypto/password.crypto";
import { IToken } from "../../../../infra/shared/crypto/token/CorrectAdmin/token";
import { AuthenticateAdminUseCase } from "./authenticate-admin.usecase";

export class AuthenticateAdminController {

  constructor(
    private correctAdminRepository: ICorrectAdminRepository,
    private passwordCrypto: IPasswordCrypto,
    private token: IToken
  ) {

  }
  async handle(req: Request, res: Response) {
    try {

      const { userName, password } = req.body

      const authAdminUsecase = new AuthenticateAdminUseCase(
        this.correctAdminRepository,
        this.passwordCrypto,
        this.token
      )

      const admin = await authAdminUsecase.execute({ userName, password })

      return res.json(admin)
    } catch (err: any) {
      console.log({err})
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}
