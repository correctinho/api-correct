import { Request, Response } from "express";
import { logger } from "../../../../../utils/logger";
import { ICompanyContractRepository } from "../../repositories/implementations/company-contract.repository";
import { CompanyContractProps } from "../../entities/company-contract.entity";
import { CreateCompanyContractUsecase } from "./create-company-contract.usecase";
import { ICompanyUserRepository } from "../../../../Company/CompanyUser/repositories/company-user.repository";
import { IPasswordCrypto } from "../../../../../crypto/password.crypto";

export class CreateCompanyContractController{
    constructor(
        private companyContractRepository: ICompanyContractRepository,
        private businessUser: ICompanyUserRepository,
        private passwordCrypto: IPasswordCrypto,


    ){}

    async handle( req: Request, res: Response){
        try{
            const adminId = req.companyUser.companyUserId

            const password = req.body.password as string

            const data: CompanyContractProps = req.body

            const contractUsecase = new CreateCompanyContractUsecase(this.companyContractRepository, this.businessUser, this.passwordCrypto)

            await contractUsecase.execute(data, adminId, password)

            return res.json({message: "Contract signed successfully"})

        }catch(err: any){
            logger.error(err.stack)
            res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}
