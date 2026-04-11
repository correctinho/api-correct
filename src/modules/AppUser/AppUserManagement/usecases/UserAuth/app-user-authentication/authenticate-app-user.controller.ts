import { Request, Response } from "express";
import { IPasswordCrypto } from "../../../../../../crypto/password.crypto";
import { IAppUserToken } from "../../../../../../infra/shared/crypto/token/AppUser/token";
import { AuthenticateAppuserUsecase } from "./authenticate-app-user.usecase";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { IRedisCacheRepository } from "../../../../../../infra/redis/redis-cache.repository";

export class AuthenticateAppUserController {

    constructor(
        private appUserRepository: IAppUserAuthRepository,
        private passwordCrypto: IPasswordCrypto,
        private token: IAppUserToken,
        private redisCacheRepository: IRedisCacheRepository
    ) { }

    async handle(req: Request, res: Response) {

        try {
            const { document, password } = req.body

            const authAppUserUsecase = new AuthenticateAppuserUsecase(
                this.appUserRepository,
                this.passwordCrypto,
                this.token,
                this.redisCacheRepository
            )

            const appUser = await authAppUserUsecase.execute({ document, password })

            return res.json(appUser)

        } catch (err: any) {
            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}
