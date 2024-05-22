import { Response, Request } from "express";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { ICompanyUserRepository } from "../../../../../Company/CompanyUser/repositories/company-user.repository";
import { GetSingleUserByBusinessAdminUsecase } from "./get-single-user-by-business-admin.usecase";

export class GetSingleUserByBusinessAdminController{
    constructor(
        private appUsersRepository: IAppUserInfoRepository,
        private businessUserRepository: ICompanyUserRepository
    ){}

    async handle(req: Request, res: Response){

        try{
            const business_user_uuid = req.companyUserId
            const employee_uuid = req.query.employeeId as string

            const usecase = new GetSingleUserByBusinessAdminUsecase(this.appUsersRepository, this.businessUserRepository)

            const result = await usecase.execute(employee_uuid, business_user_uuid)

            return res.json(result)

        }catch(err: any){
            console.log({err})
            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}