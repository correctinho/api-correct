import { Request, Response } from "express";
import { IPasswordCrypto } from "../../../../../crypto/password.crypto";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { ConfirmPasswordUsecase } from "./confirm-password.usecase";

export class ConfirmPasswordController{
    constructor(
        private companyUserRepository: ICompanyUserRepository,
        private passwordCrypto: IPasswordCrypto,
    ){}

    async handle(req: Request, res: Response){

        try{
            const password = req.body.password as string
            const currentPassword = req.companyUser.password
            const business_info_uuid = req.companyUser.businessInfoUuid
            const confirmPasswordUsecase = new ConfirmPasswordUsecase(
                this.companyUserRepository,
                this.passwordCrypto
            )

            const comparePassword = await confirmPasswordUsecase.execute(business_info_uuid, password, currentPassword)

            return res.json(comparePassword)

        }catch(err: any){
            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}
