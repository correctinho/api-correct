import { Request, Response } from "express";
import { ICompanyDataRepository } from "../../repositories/company-data.repository";
import { GetRegisteredBusinessCorrectSellerUsecase } from "./get-registered-business-by-correct-seller.usecase";

export class GetRegisteredBusinessByCorrectSellerController{
    constructor(
        private companyDataRepository: ICompanyDataRepository
    ){}

    async handle(req: Request, res: Response){

        try{
            const data= req.correctAdmin
            const correct_user = {
              uuid: data.correctAdminId,
              isAdmin: data.isAdmin,
              business_document: req.body.document
            }
            const companyDataUsecase = new GetRegisteredBusinessCorrectSellerUsecase(
                this.companyDataRepository
            )

            const companyData = await companyDataUsecase.execute(correct_user)

            return res.json(companyData)

        }catch(err: any){
            return res.status(err.statusCode).json({
                error: err.message
            })
        }


    }
}
