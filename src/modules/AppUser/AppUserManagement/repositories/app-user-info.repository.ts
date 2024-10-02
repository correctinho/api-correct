import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { AppUserInfoEntity } from "../entities/app-user-info.entity";
import { InputCreateUserInfoDTO } from "../usecases/UserInfo/create-user-info/dto/create-user-info.dto";
import { OutputGetEmployeesByBusinessDTO } from "../usecases/UserInfo/get-users-by-business-admin/dto/get-user-by-business.dto";

export interface IAppUserInfoRepository extends RepositoryInterface<AppUserInfoEntity> {
    saveOrUpdateByCSV(data: AppUserInfoEntity): Promise<string>
    findByDocumentUserInfo(document: string): Promise<AppUserInfoEntity | null>
    save(data: AppUserInfoEntity): Promise<void>
    // findByEmailUserInfo(email: string): Promise<UserInfoResponse | null>
    findByDocument2UserInfo(document2: string | null): Promise<AppUserInfoEntity>
    // findByDocument3UserInfo(document3: string | null): Promise<AppUserInfoEntity>
    findManyByBusiness(business_info_uuid: string): Promise<OutputGetEmployeesByBusinessDTO[] | []>
    createUserInfoandUpdateUserAuthByCSV(data: AppUserInfoEntity): Promise<void>
}
