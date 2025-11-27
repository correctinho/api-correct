import { OfflineTokenHistoryEventType, OfflineTokenStatus } from '@prisma/client'; // Ainda usamos a enum do Prisma
import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface"; // Sua base de repositório
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { OfflineTokenEntity } from '../entities/offline-token.entity';

export interface IOfflineTokenRepository extends RepositoryInterface<OfflineTokenEntity> {
  createMany(entities: OfflineTokenEntity[]): Promise<OfflineTokenEntity[]>;
  findByTokenCode(tokenCode: string): Promise<OfflineTokenEntity | null>;
  findByUserItem(
    userInfoUuid: Uuid,
    userItemUuid: Uuid,
    status?: OfflineTokenStatus
  ): Promise<OfflineTokenEntity[]>;
  findAllByUserInfo(user_info_uuid: Uuid): Promise<OfflineTokenEntity[]>;
  delete(uuid: Uuid): Promise<OfflineTokenEntity | null>;
  deleteManyByUserItem(userInfoUuid: Uuid, userItemUuid: Uuid): Promise<number>;
  findExpiredOrConsumed(status: OfflineTokenStatus, expiredBefore?: Date): Promise<OfflineTokenEntity[]>;
  existsByTokenCode(tokenCode: string): Promise<boolean>;
  archiveAndDelete(
    token: OfflineTokenEntity,
    historyEventType: OfflineTokenHistoryEventType,
    historyDescription: string
  ): Promise<void>;
  checkActiveTokensByUserInfo(userInfoUuid: Uuid): Promise<boolean>;
}