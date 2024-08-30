import { Request, Response } from "express";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { CreateAppUserInfoUsecase } from "./create-user-info.usecase";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { InputCreateUserInfoDTO } from "./dto/create-user-info.dto";

export class CreateUserInfoController{
    constructor(
        private appUserInfoRepository: IAppUserInfoRepository,
        private appUserAuthRepository: IAppUserAuthRepository

    ){}

    async handle(req: Request, res: Response){

        try{

            const data = req.body as InputCreateUserInfoDTO

            data.user_id = new Uuid(req.appUser.appUserId)

            const userInfoUsecase = new CreateAppUserInfoUsecase(this.appUserInfoRepository, this.appUserAuthRepository)

            await userInfoUsecase.execute(data)

            return res.status(201).json({sucess: "User info registered successfully"})
        }catch(err: any){
            return res.status(err.statusCode).json({
                error: err.message,
            });
        }
    }
}
