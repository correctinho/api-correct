import { Request, Response } from "express";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";

export class CompanyUserDetailsController{
    constructor(
        private companyUserRepository: ICompanyUserRepository
    ){}

    async handle(req: Request, res: Response){

        try{

            const companyUser = req.companyUser

            return res.json(companyUser)

        }catch(err:any){
            return res.status(err.statusCode).json({
                error: err.message
            })
        }


    }
}
