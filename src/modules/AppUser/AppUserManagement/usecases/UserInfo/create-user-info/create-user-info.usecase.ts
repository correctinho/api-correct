import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { AppUserAuthSignUpEntity } from "../../../entities/app-user-auth.entity";
import { AppUserInfoEntity, AppUserInfoProps } from "../../../entities/app-user-info.entity";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { InputCreateUserInfoDTO, OutputCreateUserInfoDTO } from "./dto/create-user-info.dto";

export class CreateAppUserInfoUsecase {
    constructor(
        private appUserInfoRepository: IAppUserInfoRepository,
        private appUserAuthRepository: IAppUserAuthRepository
    ) { }

    async execute(data: InputCreateUserInfoDTO): Promise<OutputCreateUserInfoDTO> {
        //check if document is already registered
        const findBydocument = await this.appUserInfoRepository.findByDocumentUserInfo(data.document)
        // if (findBydocument && !findAuthUser.user_info_uuid) {
        //     //In this situation, we are making sure that the tables UserAuth and UserInfo are connected

        //     const authEntity = new AppUserAuthSignUpEntity(findAuthUser)
        //     authEntity.changeUserInfo(findBydocument.uuid)

        //     //update authUser table
        //     await this.appUserAuthRepository.update(authEntity)
        //     throw new CustomError("User Info already registered", 409)
        // }

        if (findBydocument) throw new CustomError("User Info already registered - 1", 409)
        const userInfoEntity = await AppUserInfoEntity.create(data)

        await this.appUserInfoRepository.create(userInfoEntity)

        return { }


    }
}
