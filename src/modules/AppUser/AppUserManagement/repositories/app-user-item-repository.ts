import { UserItemEventType } from "@prisma/client";
import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { AppUserItemEntity } from "../entities/app-user-item.entity";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";

export type InputListCollaboratorsRepoDTO = {
    business_info_uuid: string;
    item_uuid: string;
    page: number;
    limit: number;
    status?: string; // opcional
}

export type AppUserItemWithDetails = AppUserItemEntity & {
    UserInfo?: {
        full_name: string;
        document: string;
    };
    BenefitGroups?: {
        group_name: string;
    };
}

export interface IAppUserItemRepository extends RepositoryInterface<AppUserItemEntity>{
  findByItemUuidAndUserInfo(userInfoId: string, itemId: string):Promise<AppUserItemEntity | null>
  findAllUserItems(userInfoId: string): Promise<AppUserItemEntity[] | []>
  findAllUserItemsByEmployer(userInfoId: string, businessInfoId: string): Promise<AppUserItemEntity[] | []>
  findItemByEmployeeAndBusiness(userInfoId: string, business_info_uuid: string, itemId: string):Promise<AppUserItemEntity | null>
  findDebitUserItem(userInfoId: string): Promise<AppUserItemEntity | null>
  findUserItemsWithBenefitGroupsByEmployerAndUserInfoIds(employerUuid: string, userInfoUuids: string[]): Promise<AppUserItemEntity[]>
  updateBalanceAndHistory(userItemUuid: string, newBalanceInCents: number,previousBalanceInCents: number,transactionUuid: string | null, eventType: UserItemEventType): Promise<void>;
  findSpecificUserItem(userInfoId: string, itemId: string, businessInfoId: string | null): Promise<AppUserItemEntity | null>;
  upsert(entity: AppUserItemEntity): Promise<void>;
  updateStatusBulk(uuids: Uuid[], newStatus: string): Promise<void>;
  activateManyByBusinessAndItem(
    business_info_uuid: string,
    item_uuid: string,
    user_uuids: string[]
): Promise<void>
  findAllByItemAndBusinessPaginated(
        params: InputListCollaboratorsRepoDTO
    ): Promise<{ items: AppUserItemWithDetails[]; total: number }>;
findAllActiveByBusinessAndItem(
        businessInfoUuid: string, 
        itemUuid: string
    ): Promise<AppUserItemEntity[]>;
findManyByUuids(uuids: string[]): Promise<AppUserItemEntity[]>
}
