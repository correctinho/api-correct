import { Request, Response } from "express";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { CreateAppUserInfoUsecase } from "./create-user-info.usecase";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { InputCreateUserInfoDTO } from "./dto/create-user-info.dto";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { IBenefitsRepository } from "../../../../../benefits/repositories/benefit.repository";

export class CreateUserInfoController{
    constructor(
        private appUserInfoRepository: IAppUserInfoRepository,
        private benefitsRepository: IBenefitsRepository

    ){}

    async handle(req: Request, res: Response){

        try{

            const data = req.body as InputCreateUserInfoDTO

            data.user_id = new Uuid(req.appUser.appUserId)

            data.document = req.appUser.document

            data.email = req.appUser.email

            const userInfoUsecase = new CreateAppUserInfoUsecase(this.appUserInfoRepository, this.benefitsRepository)

            await userInfoUsecase.execute(data)

            return res.status(201).json({sucess: "User info registered successfully"})
        }catch(err: any){
            return res.status(err.statusCode).json({
                error: err.message,
            });
        }
    }
}
