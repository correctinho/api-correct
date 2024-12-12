import { Request, Response } from "express";
import { IBusinessFirstRegisterRepository } from "../../repositories/business-first-register.repository";
import { BusinessRegisterProps } from "../../entities/business-first-register.entity";
import { CreateBusinessRegisterByCorrectUsecase } from "./business-first-register.usecase";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";

export class CreateBusinessRegisterByCorrectController {
    constructor(
        private businessRegisterRepository: IBusinessFirstRegisterRepository,
        private companyDataRepository: ICompanyDataRepository

    ){}

    async handle(req: Request, res: Response){
        try{
            const data = req.body

            const correctUser = req.correctAdmin.correctAdminId

            const businessRegisterUsecase = new CreateBusinessRegisterByCorrectUsecase(this.businessRegisterRepository, this.companyDataRepository)

            const result = await businessRegisterUsecase.execute(data, correctUser)
            return res.status(201).json(result)

        }catch(err: any){
            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}
