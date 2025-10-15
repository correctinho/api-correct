import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { prismaClient } from '../../../../../infra/databases/prisma.config';
import { OfflineTokenHistoryEntity } from '../../entities/offline-tokens-history.entity';
import { IOfflineTokenHistoryRepository } from '../offline-tokens-history.repository';

export class OfflineTokensHistoryPrismaRepository
    implements IOfflineTokenHistoryRepository
{
    findByTokenCode(tokenCode: string): Promise<OfflineTokenHistoryEntity[]> {
        throw new Error('Method not implemented.');
    }
    findByUserOrItem(
        userInfoUuid?: Uuid,
        userItemUuid?: Uuid
    ): Promise<OfflineTokenHistoryEntity[]> {
        throw new Error('Method not implemented.');
    }
    findByRelatedTransaction(
        transactionUuid: Uuid
    ): Promise<OfflineTokenHistoryEntity[]> {
        throw new Error('Method not implemented.');
    }
    async create(entity: OfflineTokenHistoryEntity): Promise<void> {
        const data = entity.toJSON(); // Converte a entidade para um objeto plano para o Prisma
        await prismaClient.offlineTokenHistory.create({ data });
    }
    update(entity: OfflineTokenHistoryEntity): Promise<void> {
        throw new Error('Method not implemented.');
    }
    find(id: Uuid): Promise<OfflineTokenHistoryEntity> {
        throw new Error('Method not implemented.');
    }
    findAll(): Promise<OfflineTokenHistoryEntity[]> {
        throw new Error('Method not implemented.');
    }
}
