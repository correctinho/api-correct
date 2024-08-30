import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { AppUserAuthSignUpEntity } from "../../entities/app-user-auth.entity";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { IAppUserAuthRepository } from "../app-use-auth-repository";
import { newDateF } from "../../../../../utils/date";

export class AppUserAuthPrismaRepository implements IAppUserAuthRepository {

    async find(id: Uuid): Promise<AppUserAuthSignUpEntity | null> {
        const user = await prismaClient.userAuth.findUnique({
            where:{
                uuid: id.uuid
            }
        })

        if(!user) return null

        return {
            uuid: new Uuid(user.uuid),
            user_info_uuid: user.user_info_uuid ? new Uuid(user.user_info_uuid) : null,
            document: user.document,
            email: user.email,
            password: user.password,
            is_active: user.is_active,
            created_at: user.created_at,
            updated_at: user.updated_at
        } as AppUserAuthSignUpEntity
    }
    findAll(): Promise<AppUserAuthSignUpEntity[]> {
        throw new Error("Method not implemented.");
    }


    async create(data: AppUserAuthSignUpEntity): Promise<void> {
       const user = await prismaClient.userAuth.create({
            data: {
                uuid: data.uuid.uuid,
                user_info_uuid: data.user_info_uuid ? data.user_info_uuid.uuid : null,
                document: data.document,
                email: data.email,
                password: data.password,
                created_at: data.created_at
            }
        })
    }


    async update(data: AppUserAuthSignUpEntity): Promise<void> {
        await prismaClient.userAuth.update({
            where: {
                document: data.document
            },
            data: {
                user_info_uuid: data.user_info_uuid.uuid,
                document: data.document,
                email: data.email,
                updated_at: newDateF(new Date())
            }
        })
    }

    // async saveOrUpdate(data: AppUserAuthSignUpEntity): Promise<void> {
    //     await prismaClient.userAuth.upsert({
    //         where:{
    //             document: data.document
    //         },
    //         create:{
    //             uuid: data.uuid,
    //             user_info_uuid: data.user_info_uuid,
    //             document: data.document,
    //             email: data.email,
    //             password: data.password,
    //             created_at: data.created_at
    //         },
    //         update:{
    //             user_info_uuid: data.user_info_uuid,
    //             document: data.document,
    //             email: data.email,
    //             password: data.password,
    //             updated_at: newDateF(new Date())
    //         }
    //     })
    // }

    // async findByEmail(email: string): Promise<AppUserAuthResponse | null> {
    //     return await prismaClient.userAuth.findUnique({
    //         where: {
    //             email
    //         }
    //     }) as AppUserAuthResponse | null
    // }



    // async findByDocumentAuth(document: string): Promise<AppUserAuthResponseAuthentication | null> {
    //     const appUser = await prismaClient.userAuth.findUnique({
    //         where: {
    //             document
    //         }
    //     })

    //     return appUser as AppUserAuthResponseAuthentication | null
    // }

    async findByEmail(email: string): Promise<AppUserAuthSignUpEntity | null> {
        const appUser = await prismaClient.userAuth.findUnique({
            where: {
                email: email
            }
        })
        if(!appUser) return null


        return {
            uuid: new Uuid(appUser.uuid),
            user_info_uuid: appUser.user_info_uuid ? new Uuid(appUser.user_info_uuid) : null,
            document: appUser.document,
            email: appUser.email,
            password: appUser.password,
            is_active: appUser.is_active,
            created_at: appUser.created_at,
            updated_at: appUser.updated_at

        } as AppUserAuthSignUpEntity
    }

    async findByDocument(document: string): Promise<AppUserAuthSignUpEntity | null> {
        const appUser = await prismaClient.userAuth.findUnique({
            where: {
                document: document
            }
        })

        if(!appUser) return null

        return {
            uuid: new Uuid(appUser.uuid),
            user_info_uuid: appUser.user_info_uuid ? new Uuid(appUser.user_info_uuid) : null,
            document: appUser.document,
            email: appUser.email,
            password: appUser.password,
            is_active: appUser.is_active,
            created_at: appUser.created_at,
            updated_at: appUser.updated_at

        } as AppUserAuthSignUpEntity || null
    }


    // async findById(uuid: string): Promise<AppUserAuthResponse | null> {
    //     const appUser = await prismaClient.userAuth.findUnique({
    //         where: {
    //             uuid
    //         },
    //         select: {
    //             uuid: true,
    //             user_info_uuid: true,
    //             document: true,
    //             email: true,
    //             created_at: true,
    //             updated_at: true,
    //             UserInfo: {
    //                 include: {
    //                     Address: true,
    //                     UserValidation: {
    //                         select:{
    //                             uuid: true,
    //                             document_front_status: true,
    //                             document_back_status: true,
    //                             selfie_status: true,
    //                             document_selfie_status: true
    //                         }
    //                     }
    //                 }
    //             }

    //         }
    //     });

    //     return appUser as AppUserAuthResponse | null
    // }


}
