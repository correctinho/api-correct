import { Request, Response } from "express";
import { CreateAppUserAddressUsecase } from "./create-app-user-address.usecase";
import { IAppUserAddressRepository } from "../../../repositories/app-user-address.repository";
import { InputCreateUserAddressDTO } from "./dto/create-app-user-address.dto";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";

export class CreateAppUserAddressController{
    constructor(
        private addressRepository: IAppUserAddressRepository,
        private userInfoRepository: IAppUserInfoRepository,
        private userAuthRepository: IAppUserAuthRepository

    ){}

    async handle(req: Request, res: Response){
        try{
            const data:InputCreateUserAddressDTO = req.body

            data.user_uuid = new Uuid(req.appUser.appUserId)

            const addressUsecase = new CreateAppUserAddressUsecase(this.addressRepository, this.userInfoRepository, this.userAuthRepository)

            const result = await addressUsecase.execute(data)

            return res.status(201).json(result)

        }catch(err: any){
            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}
