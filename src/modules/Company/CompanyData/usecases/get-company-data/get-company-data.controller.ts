import { Request, Response } from "express";
import { ICompanyDataRepository } from "../../repositories/company-data.repository";
import { GetCompanyDataUsecase } from "./get-company-data.usecase";
import { logger } from "../../../../../utils/logger";

export class GetCompanyDataController{
    constructor(
        private companyDataRepository: ICompanyDataRepository
    ){}

    async handle(req: Request, res: Response){

        try{
            const business_id = req.query.business_id as string

            const companyDataUsecase = new GetCompanyDataUsecase(
                this.companyDataRepository
            )
           
            const companyData = await companyDataUsecase.execute(business_id)

            return res.json(companyData)

        }catch(err: any){
            logger.error(err.stack)
            return res.status(err.statusCode).json({
                error: err.message
            })
        }


    }
}