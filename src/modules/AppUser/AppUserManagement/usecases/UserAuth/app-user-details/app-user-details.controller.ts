import { Request, Response } from "express";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { AppUserDetailsUsecase } from "./app-user-details.usecase";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";

export class AppUserDetailsController {
    constructor(
        private appUserRepository: IAppUserAuthRepository,
        private appUserInfoRepository: IAppUserInfoRepository,

    ){}

    async handle(req: Request, res: Response){
        try{
            const user_uuid = req.appUser.appUserId

            const userDetailsUsecase = new AppUserDetailsUsecase(this.appUserRepository, this.appUserInfoRepository)

            const userDetails = await userDetailsUsecase.execute(new Uuid(user_uuid))

            return res.json(userDetails)
        }catch(err: any){
            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}
