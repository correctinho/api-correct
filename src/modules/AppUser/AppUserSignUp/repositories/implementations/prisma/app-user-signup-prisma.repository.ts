import { Prisma } from "@prisma/client";
import { prismaClient } from "../../../../../../infra/databases/prisma.config";
import { AppUserSignUpEntity } from "../../../entities/app-user-signup.entity";
import { IAppUserSignupRepository } from "../../app-user-signup.repository";
import { AppUserAuthResponseAuthentication, UserInfoResponse } from "../../../../app-user-dto/app-user.dto";
import { newDateF } from "../../../../../../utils/date";


export class AppUserSignUpPrismaRepository implements IAppUserSignupRepository{
    
    
    async signUpUser(data: AppUserSignUpEntity): Promise<void> {

        const [address, userValidation,userInfo, userAuth] = await prismaClient.$transaction([

            prismaClient.address.create({
                data:{
                    uuid: data.address_pk_uuid,
                    line1: data.line1,
                    line2: data.line2,
                    line3: data.line3,
                    postal_code: data.postal_code,
                    neighborhood: data.neighborhood,
                    city: data.city,
                    state: data.state,
                    country: data.country
                }
            }),

            prismaClient.userDocumentValidation.upsert({
                where:{
                    uuid: data.user_validation_pk_uuid
                },
                create:{
                    uuid: data.user_validation_pk_uuid,
                    document_front_base64: data.document_front_base64,
                    document_front_status: data.document_front_status,
                    document_back_base64: data.document_back_base64,
                    document_back_status: data.document_back_status,
                    document_selfie_base64: data.document_back_base64,
                    document_selfie_status: data.document_selfie_status,
                    selfie_base64: data.selfie_base64,
                    selfie_status: data.document_selfie_status,
                    created_at: newDateF(),
                    updated_at: newDateF()
                }, 
                update:{
                    document_front_base64: data.document_front_base64,
                    document_front_status: data.document_front_status,
                    document_back_base64: data.document_back_base64,
                    document_back_status: data.document_back_status,
                    document_selfie_base64: data.document_back_base64,
                    document_selfie_status: data.document_selfie_status,
                    selfie_base64: data.selfie_base64,
                    selfie_status: data.document_selfie_status,
                    updated_at: newDateF()
                }
            }),

            prismaClient.userInfo.upsert({
                where:{
                    document: data.document
                },
                create:{
                    uuid: data.user_info_pk_uuid,
                    business_info_uuid: data.business_info_uuid,
                    address_uuid: data.address_pk_uuid,
                    document: data.document,
                    document2: data.document2,
                    document3: data.document3,
                    full_name: data.full_name,
                    display_name: data.display_name,
                    internal_company_code: data.internal_company_code,
                    gender: data.gender,
                    email: data.email,
                    date_of_birth: data.date_of_birth,
                    phone: data.phone,
                    salary: data.salary,
                    company_owner: data.company_owner,
                    function: data.function,
                    recommendation_code: data.recommendation_code,
                    marital_status: data.marital_status,
                    dependents_quantity: data.dependents_quantity,
                    user_document_validation_uuid: data.user_document_validation_uuid,
                    status: data.status,
                    created_at: newDateF(),
                    updated_at: newDateF()

                },
                update:{
                    business_info_uuid: data.business_info_uuid,
                    address_uuid: data.address_pk_uuid,
                    document: data.document,
                    document2: data.document2,
                    document3: data.document3,
                    full_name: data.full_name,
                    display_name: data.display_name,
                    internal_company_code: data.internal_company_code,
                    gender: data.gender,
                    email: data.email,
                    date_of_birth: data.date_of_birth,
                    phone: data.phone,
                    salary: data.salary,
                    company_owner: data.company_owner,
                    function: data.function,
                    recommendation_code: data.recommendation_code,
                    marital_status: data.marital_status,
                    dependents_quantity: data.dependents_quantity,
                    user_document_validation_uuid: data.user_document_validation_uuid,
                    status: data.status,
                    updated_at: newDateF()                              

                }
            }),

            prismaClient.userAuth.create({
                data:{
                    uuid: data.user_auth_uuid,
                    user_info_uuid: data.user_info_fk_uuid,
                    document: data.document,
                    password: data.password,
                    created_at: newDateF(),
                    updated_at: newDateF()
                }
            })

        ])
    }

    async findByDocumentUserAuth(document: string): Promise<AppUserAuthResponseAuthentication | null> {
        const user = await prismaClient.userAuth.findUnique({
            where:{
                document
            }
        })

        return user
    }

    
    

}