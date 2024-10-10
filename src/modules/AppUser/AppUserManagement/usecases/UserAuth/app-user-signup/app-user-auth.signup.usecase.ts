import { CustomError } from "../../../../../../errors/custom.error";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { AppUserAuthSignUpEntity } from "../../../entities/app-user-auth.entity";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { InputCreateAppUserDTO, OutputCreateappUserDTO } from "../../../../app-user-dto/app-user.dto";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";

export class AppUserAuthSignUpUsecase {
    constructor(
        private appUserSingUpRepository: IAppUserAuthRepository,
        private appUserInfoRepository: IAppUserInfoRepository
    ) { }

    async execute(data: InputCreateAppUserDTO): Promise<OutputCreateappUserDTO> {
        const authEntity = new AppUserAuthSignUpEntity(data)

        const [findUserByDocument, findUserByEmail] = await Promise.all([
            this.appUserSingUpRepository.findByDocument(authEntity.document),
            this.appUserSingUpRepository.findByEmail(authEntity.email)
        ]);

        //check if app user is already registered by document
        if (findUserByDocument) throw new CustomError("User already has an account", 409)

        //find user by email
        if (findUserByEmail) throw new CustomError("Email already in use", 409)

        //check if user was already registered by Correct
        const findUser = await this.appUserInfoRepository.findByDocumentUserInfo(authEntity.document)
        if (findUser) {
            authEntity.changeUserInfo(new Uuid(findUser.uuid))
        }


        const createEntity = await AppUserAuthSignUpEntity.create(authEntity)

        await this.appUserSingUpRepository.create(createEntity)

        return {
            uuid: createEntity.uuid.uuid,
            user_info_uuid: createEntity.user_info_uuid,
            document: createEntity.document,
            email: createEntity.email,
            is_active: createEntity.is_active,
        }

    }


}
