import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { OfflineTokenHistoryEntity } from "../entities/offline-token.entity";

export interface IOfflineTokenHistoryRepository extends RepositoryInterface<OfflineTokenHistoryEntity> {
  findByTokenCode(tokenCode: string): Promise<OfflineTokenHistoryEntity[]>;
  findByUserOrItem(userInfoUuid?: Uuid, userItemUuid?: Uuid): Promise<OfflineTokenHistoryEntity[]>;
  findByRelatedTransaction(transactionUuid: Uuid): Promise<OfflineTokenHistoryEntity[]>;
}