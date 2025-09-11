import { UserDocumentValidationStatus } from "@prisma/client";
import { CustomError } from "../../../../../../errors/custom.error";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { OutputAppUserDetailsDTO } from "../../../../app-user-dto/app-user.dto";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";

export class AppUserDetailsUsecase {
    constructor(
        private appUserAuthRepository: IAppUserAuthRepository,
        private appUserInfoRepository: IAppUserInfoRepository,
    ) { }

    async execute(uuid: Uuid): Promise<OutputAppUserDetailsDTO> {

        //Find User
        const findUser = await this.appUserAuthRepository.find(uuid)
        if (!findUser) throw new CustomError("User not found", 404)
        
            if (!findUser.user_info_uuid) {
            return {
                status: false,
                UserAuthDetails: {
                    uuid: findUser.uuid.uuid,
                    user_info_uuid: findUser.user_info_uuid ? findUser.user_info_uuid.uuid : null,
                    document: findUser.document,
                    email: findUser.email,
                    created_at: findUser.created_at,
                    updated_at: findUser.updated_at
                },
                UserInfo: false,
                UserAddress: false,
                UserValidation: false

            }
        }

        //Check if User has more info
        const userInfo = await this.appUserInfoRepository.findByDocumentUserInfo(findUser.document)

        if (!userInfo) {
            return {
                status: false,
                UserAuthDetails: {
                    uuid: findUser.uuid.uuid,
                    user_info_uuid: findUser.user_info_uuid ? findUser.user_info_uuid.uuid : null,
                    document: findUser.document,
                    email: findUser.email,
                    created_at: findUser.created_at,
                    updated_at: findUser.updated_at
                },
                UserInfo: false,
                UserAddress: false,
                UserValidation: false

            }
        }

        if (!userInfo.address_uuid) {
            return {
                status: false,
                UserAuthDetails: {
                    uuid: findUser.uuid.uuid,
                    user_info_uuid: findUser.user_info_uuid ? findUser.user_info_uuid.uuid : null,
                    document: findUser.document,
                    email: findUser.email,
                    created_at: findUser.created_at,
                    updated_at: findUser.updated_at
                },
                UserInfo: true,
                UserAddress: false,
                UserValidation: false
            }
        }

        if (!userInfo.user_document_validation_uuid) {
            return {
                status: false,
                UserAuthDetails: {
                    uuid: findUser.uuid.uuid,
                    user_info_uuid: findUser.user_info_uuid ? findUser.user_info_uuid.uuid : null,
                    document: findUser.document,
                    email: findUser.email,
                    created_at: findUser.created_at,
                    updated_at: findUser.updated_at
                },
                UserInfo: true,
                UserAddress: true,
                UserValidation: false
            }
        }

        return {
            status: true,
            UserAuthDetails: {
                uuid: findUser.uuid.uuid,
                user_info_uuid: findUser.user_info_uuid ? findUser.user_info_uuid.uuid : null,
                document: findUser.document,
                pin_code: findUser.transaction_pin ? true : false,
                email: findUser.email,
                created_at: findUser.created_at,
                updated_at: findUser.updated_at
            },
            UserInfo: true,
            UserAddress: true,
            UserValidation: true
        }

       
    }
}