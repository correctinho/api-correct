import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { IAppUserAuthRepository } from "../app-use-auth-repository";
import { AppUserAuthResponse, AppUserAuthResponseAuthentication } from "../../../app-user-dto/app-user.dto";

export class AppUserAuthPrismaRepository implements IAppUserAuthRepository {


    async findByDocumentAuth(document: string): Promise<AppUserAuthResponseAuthentication | null> {
        const appUser = await prismaClient.userAuth.findUnique({
            where: {
                document
            }
        })

        return appUser
    }

    async findByDocument(document: string): Promise<AppUserAuthResponse | null> {
        const appUser = await prismaClient.userAuth.findUnique({
            where: {
                document
            },
            include:{
                UserInfo: {
                    include: {
                        Address: true,
                        UserValidation: true
                    }
                }
            }
        })

        return appUser
    }


    async findById(uuid: string): Promise<AppUserAuthResponse | null> {
        const appUser = await prismaClient.userAuth.findUnique({
            where: {
                uuid
            },
            select: {
                uuid: true,
                document: true,
                created_at: true,
                updated_at: true,
                UserInfo: {
                    include: {
                        Address: true,
                        UserValidation: {
                            select: {
                                uuid: true,
                                document_front_status: true,
                                document_back_status: true,
                                selfie_status: true,
                                document_selfie_status: true,
                                created_at: true,
                                updated_at: true
                            }
                        }
                    }
                }
            }
        });
    
        return appUser;
    }
    

}