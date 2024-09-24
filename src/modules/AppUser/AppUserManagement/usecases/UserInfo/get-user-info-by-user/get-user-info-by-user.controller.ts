import { Response, Request } from "express";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { GetUserInfoByUserUsecase } from "./get-user-info-by-user.usecase";
import { ICompanyDataRepository } from "../../../../../Company/CompanyData/repositories/company-data.repository";
import { InputFindUserByUserDTO } from "./dto/get-user-by-user.dto";

export class GetUserInfoByUserController{
    constructor(
        private appUsersRepository: IAppUserInfoRepository,
        private businessInfoRepository: ICompanyDataRepository
    ){}

    async handle(req: Request, res: Response){

        try{
            const userDocument = req.appUser.document
            const usecase = new GetUserInfoByUserUsecase(this.appUsersRepository, this.businessInfoRepository)

            const result = await usecase.execute(userDocument)
            return res.json(result)

        }catch(err: any){

            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}
