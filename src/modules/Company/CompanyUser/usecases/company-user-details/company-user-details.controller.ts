import { Request, Response } from "express";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";

export class CompanyUserDetailsController{
    constructor(
        private companyUserRepository: ICompanyUserRepository
    ){}

    async handle(req: Request, res: Response){

        try{

            const companyUser = req.companyUser

            const user = {
              uuid: companyUser.companyUserId,
              business_info_uuid: companyUser.businessInfoUuid,
              is_admin: companyUser.isAdmin,
              document: companyUser.document,
              name: companyUser.name,
              email: companyUser.email,
              user_name: companyUser.userName,
              function: companyUser.function,
              permissions: companyUser.permissions,
              status: companyUser.status,
              created_at: companyUser.created_at,
              updated_at: companyUser.updated_at
            }
            return res.json(user)

        }catch(err:any){
            return res.status(err.statusCode).json({
                error: err.message
            })
        }


    }
}
