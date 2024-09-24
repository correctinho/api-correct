import { Response, Request } from "express";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { ICompanyUserRepository } from "../../../../../Company/CompanyUser/repositories/company-user.repository";
import { GetUsersByBusinessAdminUsecase } from "./get-users-by-business-admin.usecasse";
import { OutputCompanyUserDTO } from "../../../../../../infra/shared/middlewares/CompanyAdmin/ensure-valid-company-admin.usecase.middlware";

export class GetUsersByBusinessAdminController{
    constructor(
        private appUsersRepository: IAppUserInfoRepository,
        private businessUserRepository: ICompanyUserRepository
    ){}

    async handle(req: Request, res: Response){

        try{
          const businessAdmin: OutputCompanyUserDTO = {
            uuid: req.companyUser.companyUserId,
            businessInfoUuid: req.companyUser.businessInfoUuid,
            isAdmin: req.companyUser.isAdmin,
            document: req.companyUser.document,
            name: req.companyUser.name,
            email: req.companyUser.email,
            userName: req.companyUser.userName,
            function: req.companyUser.function,
            permissions: req.companyUser.permissions,
            status: req.companyUser.status,
            created_at: req.companyUser.created_at,
            updated_at: req.companyUser.updated_at
          }

            const usecase = new GetUsersByBusinessAdminUsecase(this.appUsersRepository, this.businessUserRepository)

            const result = await usecase.execute(businessAdmin)

            return res.json(result)

        }catch(err: any){

            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}
