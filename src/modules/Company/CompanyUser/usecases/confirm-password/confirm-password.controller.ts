import { Request, Response } from "express";
import { IPasswordCrypto } from "../../../../../crypto/password.crypto";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { logger } from "../../../../../utils/logger";
import { ConfirmPasswordUsecase } from "./confirm-password.usecase";

export class ConfirmPasswordController{
    constructor(
        private companyUserRepository: ICompanyUserRepository,
        private passwordCrypto: IPasswordCrypto,
    ){}

    async handle(req: Request, res: Response){

        try{
            const user_id = req.companyUser.companyUserId
            const password = req.body.password as string

            const confirmPasswordUsecase = new ConfirmPasswordUsecase(
                this.companyUserRepository,
                this.passwordCrypto
            )

            const comparePassword = await confirmPasswordUsecase.execute(user_id, password)

            return res.json(comparePassword)

        }catch(err: any){
            logger.error(err.stack)
            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}
