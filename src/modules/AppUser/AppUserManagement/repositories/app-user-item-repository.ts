import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { AppUserItemEntity } from "../entities/app-user-item.entity";

export interface IAppUserItemRepository extends RepositoryInterface<AppUserItemEntity>{
  findByItemUuidAndUserInfo(userInfoId: string, itemId: string):Promise<AppUserItemEntity | null>
  findAllUserItems(userInfoId: string): Promise<AppUserItemEntity[] | []>
  findItemByEmployeeAndBusiness(userInfoId: string, business_info_uuid: string, itemId: string):Promise<AppUserItemEntity | null>
  findDebitUserItem(userInfoId: string): Promise<AppUserItemEntity | null>

}
