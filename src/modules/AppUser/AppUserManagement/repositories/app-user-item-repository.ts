import { UserItemEventType } from "@prisma/client";
import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { AppUserItemEntity } from "../entities/app-user-item.entity";

export interface IAppUserItemRepository extends RepositoryInterface<AppUserItemEntity>{
  findByItemUuidAndUserInfo(userInfoId: string, itemId: string):Promise<AppUserItemEntity | null>
  findAllUserItems(userInfoId: string): Promise<AppUserItemEntity[] | []>
  findAllUserItemsByEmployer(userInfoId: string, businessInfoId: string): Promise<AppUserItemEntity[] | []>
  findItemByEmployeeAndBusiness(userInfoId: string, business_info_uuid: string, itemId: string):Promise<AppUserItemEntity | null>
  findDebitUserItem(userInfoId: string): Promise<AppUserItemEntity | null>
  findUserItemsWithBenefitGroupsByEmployerAndUserInfoIds(employerUuid: string, userInfoUuids: string[]): Promise<AppUserItemEntity[]>
  updateBalanceAndHistory(userItemUuid: string, newBalanceInCents: number,previousBalanceInCents: number,transactionUuid: string | null, eventType: UserItemEventType): Promise<void>;
  findSpecificUserItem(userInfoId: string, itemId: string, businessInfoId: string | null): Promise<AppUserItemEntity | null>;}
