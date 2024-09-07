import { Request, Response } from "express";
import { IBusinessFirstRegisterRepository } from "../../repositories/business-first-register.repository";
import { BusinessRegisterProps } from "../../entities/business-first-register.entity";
import { CreateBusinessRegisterUsecase } from "./business-first-register.usecase";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";

export class CreateBusinessRegisterController {
    constructor(
        private businessRegisterRepository: IBusinessFirstRegisterRepository,
        private companyDataRepository: ICompanyDataRepository

    ){}

    async handle(req: Request, res: Response){
        try{
            const data: BusinessRegisterProps = req.body

            const businessRegisterUsecase = new CreateBusinessRegisterUsecase(this.businessRegisterRepository, this.companyDataRepository)

            const result = await businessRegisterUsecase.execute(data)
            return res.status(201).json(result)

        }catch(err: any){
            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}
