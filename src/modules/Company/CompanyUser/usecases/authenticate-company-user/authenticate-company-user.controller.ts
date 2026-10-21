import { Request, Response } from "express";
import { IPasswordCrypto } from "../../../../../crypto/password.crypto";
import { ICompanyAdminToken } from "../../../../../infra/shared/crypto/token/CompanyAdmin/token";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { AuthenticateCompanyUserUsecase } from "./authenticate-company-user.usecase";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { IRedisCacheRepository } from "../../../../../infra/redis/redis-cache.repository";
import { TwoFactorAuthService } from "../../services/two-factor-auth.service";

export class AuthenticateCompanyAdminController {
    constructor(
        private companyUserRepository: ICompanyUserRepository,
        private companyDataRepository: ICompanyDataRepository,
        private passwordCrypto: IPasswordCrypto,
        private token: ICompanyAdminToken,
        private redisCacheRepository: IRedisCacheRepository,
        private twoFactorAuthService: TwoFactorAuthService
    ) { }

    async handle(req: Request, res: Response) {
        try {
            const { business_document, user_name, password, email, required_business_type } = req.body
            const authCompanyUserUsecase = new AuthenticateCompanyUserUsecase(
                this.companyUserRepository,
                this.companyDataRepository,
                this.passwordCrypto,
                this.token,
                this.redisCacheRepository,
                this.twoFactorAuthService
            )

            const companyUser = await authCompanyUserUsecase.execute({ business_document, user_name, password, email, required_business_type })
            return res.json(companyUser)

        } catch (err: any) {
            console.log(err)
            return res.status(err.statusCode || 500).json({
                error: err.message || "Erro durante a autenticação."
            })
        }
    }
}
