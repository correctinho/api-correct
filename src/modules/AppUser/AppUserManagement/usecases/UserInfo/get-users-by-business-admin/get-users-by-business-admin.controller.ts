import { Response, Request } from "express";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { ICompanyUserRepository } from "../../../../../Company/CompanyUser/repositories/company-user.repository";
import { GetUsersByBusinessAdminUsecase } from "./get-users-by-business-admin.usecase";

export class GetUsersByBusinessAdminController{
    constructor(
        private appUsersRepository: IAppUserInfoRepository,
    ){}

    async handle(req: Request, res: Response){

        try{
          const businessInfoUuid = req.companyUser.businessInfoUuid

           const usecase = new GetUsersByBusinessAdminUsecase(this.appUsersRepository)

            const result = await usecase.execute(businessInfoUuid)
            return res.json(result)

        }catch(err: any){
            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}
