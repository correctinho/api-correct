import { Request, Response } from "express";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { GetUsersUsecase } from "./get-users.usecase";

export class GetUsersController{
    constructor(
        private companyUserRepository: ICompanyUserRepository
    ) {}

    async handle(req: Request, res: Response){
        try{

            const business_info_uuid = req.companyUser.businessInfoUuid as string

            const getUsersUsecase = new GetUsersUsecase(this.companyUserRepository)

            const users = await getUsersUsecase.execute(business_info_uuid)
            return res.json(users)

        }catch(err: any){
            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}
