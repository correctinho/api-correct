import { Request, Response } from "express";
import { IPasswordCrypto } from "../../../../../../crypto/password.crypto";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { SetAppUserTransactionPinUsecase } from "./set-transaction-pin.usecase";

export class SetAppUserTransactionPinController {
    constructor(
        private readonly appUserAuthRepository: IAppUserAuthRepository,
        private readonly hashService: IPasswordCrypto // Agora o serviço de hash é uma dependência
    ) { }

    async handle(req: Request, res: Response){
        try{
            const data = req.body
            data.userId = req.appUser.appUserId // Vem do middleware de autenticação
            const usecase = new SetAppUserTransactionPinUsecase(
                this.appUserAuthRepository,
                this.hashService
            )
            const result = await usecase.execute(data)
            return res.status(200).json(result
            )
        }catch(err: any){
            return res.status(err.statusCode || 500).json({
                error: err.message || 'Internal server error'
            })
        }
    }
}