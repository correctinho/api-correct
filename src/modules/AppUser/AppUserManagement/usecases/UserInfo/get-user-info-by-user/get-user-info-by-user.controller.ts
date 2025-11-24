import { Response, Request } from "express";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { GetUserInfoByUserUsecase } from "./get-user-info-by-user.usecase";
import { IOfflineTokenRepository } from "../../../../../Payments/OfflineTokens/repositories/offline-tokens.repository";

export class GetUserInfoByUserController{
    constructor(
         private appUsersRepository: IAppUserInfoRepository,
        private activeTokenRepository: IOfflineTokenRepository
    ){}

    async handle(req: Request, res: Response){

        try{
            const userDocument = req.appUser.document
            const usecase = new GetUserInfoByUserUsecase(this.appUsersRepository, this.activeTokenRepository)

            const result = await usecase.execute(userDocument)
            return res.json(result)

        }catch(err: any){

            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}
