import { Request, Response } from "express";
import { CustomError } from "../../../../../../errors/custom.error";
import { AddressEntity } from "../../../../../../infra/shared/address/address.entity";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { IAppUserAddressRepository } from "../../../repositories/app-user-address.repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { InputUpdateAppUserAddressDTO, OutputUpdateAppUserAddressDTO } from "./dto/update-app-user-address.dto";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { UpdateAppUserAddressUsecase } from "./update-app-user-address.usecase";

export class UpdateAppUserAddressController {
    constructor(
        private addressRepository: IAppUserAddressRepository,
        private userInfoRepository: IAppUserInfoRepository,
        private userAuthRepository: IAppUserAuthRepository
    ) { }

    async handle(req: Request, res: Response) {
        try{
            const data = req.body

            data.user_uuid = new Uuid(req.appUser.appUserId)

            const updateAddressUsecase = new UpdateAppUserAddressUsecase(this.addressRepository, this.userInfoRepository, this.userAuthRepository)

            const result = await updateAddressUsecase.execute(data)

            return res.status(200).json(result)
        }catch(err: any){
            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}
