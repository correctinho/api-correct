import { ICompanyUserRepository } from "../../../../modules/Company/CompanyUser/repositories/company-user.repository";
import { Request, Response } from "express";
import { EnsureValidCompanyUserUsecase } from "./ensure-valid-company-admin.usecase.middlware";

export class EnsureValidCompanyUserController{
    constructor(
        private companyUserRepository: ICompanyUserRepository

    ){
    }
    async handle(req: Request, res: Response){
        try{
            const companyUserId = req.companyUser.companyUserId
            const validUserUsecase = new EnsureValidCompanyUserUsecase(this.companyUserRepository)

            const user = await validUserUsecase.execute(companyUserId)
            return user
        }catch(err: any){
            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }

}
