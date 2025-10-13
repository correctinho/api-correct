import { UserDocumentValidationStatus } from '@prisma/client';
import { DocumentValidator } from '../../../../../../utils/document-validation';
import { OutputGetByDocument } from '../../../../app-user-dto/app-user.dto';
import { IAppUserAuthRepository } from '../../../repositories/app-use-auth-repository';
import { IAppUserDocumentValidationRepository } from '../../../repositories/app-user-document-validation.repository';
import { IAppUserInfoRepository } from '../../../repositories/app-user-info.repository';

export class GetByDocumentUsecase {
    constructor(
        private appUserRepository: IAppUserAuthRepository,
        private appUserInfoRepository: IAppUserInfoRepository,
        private appUserValidationRepository: IAppUserDocumentValidationRepository
    ) {}

    async execute(document: string): Promise<OutputGetByDocument> {
        const documentValidator = new DocumentValidator();
        const documentValidated = documentValidator.validator(document);

        let status: boolean = true;
        let userAuth: boolean = true;
        let userInfo: boolean = true;
        let address: boolean = true;

        const getUserAuth = await this.appUserRepository.findByDocument(documentValidated);
        if (!getUserAuth) {
            status = false;
            userAuth = false;

            //It's possible that user info exists and user auth does not
            const userInfoByDocument = await this.appUserInfoRepository.findByDocumentUserInfo(documentValidated)
            if(!userInfoByDocument){
                userInfo = false
                address = false
                return {
                    status: status,
                    UserAuth: userAuth,
                    UserInfo: userInfo,
                    Address: address,
                    UserValidation: {
                        document_front_status: UserDocumentValidationStatus.pending_to_send,
                        document_back_status: UserDocumentValidationStatus.pending_to_send,
                        selfie_status: UserDocumentValidationStatus.pending_to_send,
                        document_selfie_status: UserDocumentValidationStatus.pending_to_send,
                    },
                };
            }else{
                //check if address exists
                if(!userInfoByDocument.address_uuid){
                    userInfo = true
                    address = false

                    return {
                    status: status,
                    UserAuth: userAuth,
                    UserInfo: userInfo,
                    Address: address,
                    UserValidation: {
                        document_front_status: UserDocumentValidationStatus.pending_to_send,
                        document_back_status: UserDocumentValidationStatus.pending_to_send,
                        selfie_status: UserDocumentValidationStatus.pending_to_send,
                        document_selfie_status: UserDocumentValidationStatus.pending_to_send,
                    },
                };
                }
                userInfo = true
                address = true
                return {
                    status: status,
                    UserAuth: userAuth,
                    UserInfo: userInfo,
                    Address: address,
                    UserValidation: {
                        document_front_status: UserDocumentValidationStatus.pending_to_send,
                        document_back_status: UserDocumentValidationStatus.pending_to_send,
                        selfie_status: UserDocumentValidationStatus.pending_to_send,
                        document_selfie_status: UserDocumentValidationStatus.pending_to_send,
                    },
                };
            }
        }
        if (getUserAuth) {
            if (!getUserAuth.user_info_uuid) {
                status = false;
                userAuth = true;
                userInfo = false;
                address = false;

                return {
                    status: status,
                    UserAuth: userAuth,
                    UserInfo: userInfo,
                    Address: address,
                    UserValidation: {
                        document_front_status: UserDocumentValidationStatus.pending_to_send,
                        document_back_status: UserDocumentValidationStatus.pending_to_send,
                        selfie_status: UserDocumentValidationStatus.pending_to_send,
                        document_selfie_status: UserDocumentValidationStatus.pending_to_send,
                    },
                };
                
            }
            const getUserInfo = await this.appUserInfoRepository.find(
                getUserAuth.user_info_uuid
            );
            if (!getUserInfo) {
                status = false;
                userAuth = true;
                userInfo = false;
                address = false;

                return {
                    status: status,
                    UserAuth: userAuth,
                    UserInfo: userInfo,
                    Address: address,
                    UserValidation: {
                        document_front_status: UserDocumentValidationStatus.pending_to_send,
                        document_back_status: UserDocumentValidationStatus.pending_to_send,
                        selfie_status: UserDocumentValidationStatus.pending_to_send,
                        document_selfie_status: UserDocumentValidationStatus.pending_to_send,
                    },
                };
            }

            status = getUserInfo.status === 'active' ? true : false
    
            if (!getUserInfo.address_uuid) {
                status = false;
                userAuth = true;
                userInfo = true;
                address = false;
                return {
                    status: status,
                    UserAuth: userAuth,
                    UserInfo: userInfo,
                    Address: address,
                    UserValidation: {
                        document_front_status: UserDocumentValidationStatus.pending_to_send,
                        document_back_status: UserDocumentValidationStatus.pending_to_send,
                        selfie_status: UserDocumentValidationStatus.pending_to_send,
                        document_selfie_status: UserDocumentValidationStatus.pending_to_send,
                    },
                };
            }
    
            if (!getUserInfo.user_document_validation_uuid) {
                status = false;
                userAuth = true;
                userInfo = true;
                address = true;
                return {
                    status: status,
                    UserAuth: userAuth,
                    UserInfo: userInfo,
                    Address: address,
                    UserValidation: {
                        document_front_status: UserDocumentValidationStatus.pending_to_send,
                        document_back_status: UserDocumentValidationStatus.pending_to_send,
                        selfie_status: UserDocumentValidationStatus.pending_to_send,
                        document_selfie_status: UserDocumentValidationStatus.pending_to_send,
                    },
                };
            }
    
            const userValidations =
                await this.appUserValidationRepository.findStatuses(
                    getUserInfo.user_document_validation_uuid
                );
            if (!userValidations) {
                status = false;
                userAuth = true;
                userInfo = true;
                address = true;
                return {
                    status: status,
                    UserAuth: userAuth,
                    UserInfo: userInfo,
                    Address: address,
                    UserValidation: {
                        document_front_status: UserDocumentValidationStatus.pending_to_send,
                        document_back_status: UserDocumentValidationStatus.pending_to_send,
                        selfie_status: UserDocumentValidationStatus.pending_to_send,
                        document_selfie_status: UserDocumentValidationStatus.pending_to_send,
                    },
                };
            }
            
            if (
                (userValidations.document_front_status !== 'approved' && userValidations.document_front_status !== "under_analysis") ||
                (userValidations.document_back_status !== 'approved' && userValidations.document_back_status !== "under_analysis") ||
                (userValidations.selfie_status !== 'approved' && userValidations.selfie_status !== "under_analysis") ||
                (userValidations.document_selfie_status !== 'approved' && userValidations.document_selfie_status !== "under_analysis")
            ) {
                status = false;
            }
            return {
                status: status,
                UserAuth: userAuth,
                UserInfo: userInfo,
                Address: address,
                UserValidation: {
                    document_front_status: userValidations.document_front_status,
                    document_back_status: userValidations.document_back_status,
                    selfie_status: userValidations.selfie_status,
                    document_selfie_status: userValidations.document_selfie_status,
                },
            };
        }
    }
}
