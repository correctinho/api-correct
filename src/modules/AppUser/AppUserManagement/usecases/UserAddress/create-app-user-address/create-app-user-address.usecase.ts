import { CustomError } from "../../../../../../errors/custom.error";
import { AddressEntity } from "../../../../../../infra/shared/address/address.entity";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { IAppUserAddressRepository } from "../../../repositories/app-user-address.repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { InputCreateUserAddressDTO, OutputCreateUserAddressDTO } from "./dto/create-app-user-address.dto";

export class CreateAppUserAddressUsecase{
    constructor(
        private addressRepository: IAppUserAddressRepository,
        private userInfoRepository: IAppUserInfoRepository,
        private userAuthRepository: IAppUserAuthRepository
    ){}

    async execute(data: InputCreateUserAddressDTO):Promise<OutputCreateUserAddressDTO>{

        //find user auth
        const userAuth = await this.userAuthRepository.find(data.user_uuid)

        if(!userAuth) throw new CustomError("User not found", 401)

        //find user info
        const userInfo = await this.userInfoRepository.findByDocumentUserInfo(userAuth.document)
        if(!userInfo) throw new CustomError("User info must be completed first", 404)


        const userAddress = await AddressEntity.create(data)

        await this.addressRepository.createAddress(userAddress, userAuth.document)

        return {
            uuid: userAddress.uuid.uuid,
            line1: userAddress.line1,
            line2: userAddress.line2,
            line3: userAddress.line3,
            postal_code: userAddress.postal_code,
            neighborhood: userAddress.neighborhood,
            city: userAddress.city,
            state: userAddress.state,
            country: userAddress.country,
            created_at: userAddress.created_at,
            updated_at: userAddress.updated_at,
            user_uuid: data.user_uuid.uuid
        }

    }
}
