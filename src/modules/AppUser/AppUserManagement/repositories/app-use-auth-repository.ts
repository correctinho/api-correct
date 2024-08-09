import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface"
import { AppUserAuthSignUpEntity } from "../entities/app-user-auth.entity"


export interface IAppUserAuthRepository extends RepositoryInterface<AppUserAuthSignUpEntity>{
    findByDocument(document: string): Promise<AppUserAuthSignUpEntity>
    findByEmail(email: string): Promise<AppUserAuthSignUpEntity>

}