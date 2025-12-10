import { OfflineTokenHistoryEventType, OfflineTokenStatus } from '@prisma/client';
import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { IOfflineTokenRepository } from '../offline-tokens.repository';
import {
    OfflineTokenEntity,
    OfflineTokenProps,
} from '../../entities/offline-token.entity';
import { prismaClient } from '../../../../../infra/databases/prisma.config';

export class OfflineTokensPrismaRepository implements IOfflineTokenRepository {
    async checkActiveTokensByUserInfo(userInfoUuid: Uuid): Promise<boolean> {
    // Tenta encontrar APENAS O PRIMEIRO registro que bate com a condição.
    const firstActiveToken = await prismaClient.offlineToken.findFirst({
        where: {
            user_info_uuid: userInfoUuid.uuid,
            status: OfflineTokenStatus.ACTIVE,
        },
        select: {
            token_code: true, 
        },
    });

    return !!firstActiveToken;
}
    async archiveAndDelete(
    token: OfflineTokenEntity,
    historyEventType: OfflineTokenHistoryEventType,
    historyDescription: string
  ): Promise<void> {
    
    // Assegura que estamos usando os valores string dos UUIDs
    const tokenUuid = token.uuid.uuid;
    const userInfoUuid = token.user_info_uuid.uuid;
    const userItemUuid = token.user_item_uuid.uuid;
    
    await prismaClient.$transaction(async (tx) => {
      // 1. Criar o registro no Histórico
      await tx.offlineTokenHistory.create({
        data: {
          original_token_uuid: tokenUuid,
          token_code: token.token_code,
          user_info_uuid: userInfoUuid,
          user_item_uuid: userItemUuid,
          event_type: historyEventType,
          event_description: historyDescription,
          snapshot_status: token.status,
          snapshot_expires_at: token.expires_at,
          // event_at é @default(now()) no schema
        }
      });

      // 2. Deletar o token da tabela principal
      await tx.offlineToken.delete({
        where: { uuid: tokenUuid }
      });
    });
  }
    async findAllByUserInfo(user_info_uuid: Uuid): Promise<OfflineTokenEntity[]> {
        const tokens = await prismaClient.offlineToken.findMany({
            where: {
                user_info_uuid: user_info_uuid.uuid,
                //status: OfflineTokenStatus.ACTIVE,
            },
        });

        return tokens.map((prismaToken) =>
            OfflineTokenEntity.hydrate({
                uuid: new Uuid(prismaToken.uuid),
                token_code: prismaToken.token_code,
                user_info_uuid: new Uuid(prismaToken.user_info_uuid),
                user_item_uuid: new Uuid(prismaToken.user_item_uuid),
                status: prismaToken.status,
                expires_at: prismaToken.expires_at,
                activated_at: prismaToken.activated_at,
                last_accessed_at: prismaToken.last_accessed_at,
                last_used_at: prismaToken.last_used_at,
                sequence_number: prismaToken.sequence_number,
                created_at: prismaToken.created_at,
                updated_at: prismaToken.updated_at,
            })
        );
    }
    // async createMany(
    //     entities: OfflineTokenEntity[]
    // ): Promise<OfflineTokenEntity[]> {
    //     const data = entities.map((entity) => entity.toJSON()); // Converte entidades para objetos planos
    //     console.log({data})
    //     const createdPrismaTokens =
    //         await prismaClient.offlineToken.createManyAndReturn({ data }); 

    //     // Mapeia os objetos do Prisma de volta para entidades
    //     return createdPrismaTokens.map((prismaToken) =>
    //         OfflineTokenEntity.hydrate({
    //             uuid: new Uuid(prismaToken.uuid),
    //             token_code: prismaToken.token_code,
    //             user_info_uuid: new Uuid(prismaToken.user_info_uuid),
    //             user_item_uuid: new Uuid(prismaToken.user_item_uuid),
    //             status: prismaToken.status,
    //             expires_at: prismaToken.expires_at,
    //             activated_at: prismaToken.activated_at,
    //             last_accessed_at: prismaToken.last_accessed_at,
    //             last_used_at: prismaToken.last_used_at,
    //             sequence_number: prismaToken.sequence_number,
    //             created_at: prismaToken.created_at,
    //             updated_at: prismaToken.updated_at,
    //         })
    //     );
    // }
    async createMany(
    entities: OfflineTokenEntity[]
): Promise<OfflineTokenEntity[]> {
    // Mapeamento explícito campo por campo para o formato de entrada do Prisma
    const prismaCreateInputData = entities.map((entity) => {
        // Usamos toJSON() para obter os valores primitivos (strings para UUIDs, Dates, etc.)
        const rawData = entity.toJSON();
        return {
            // Mapeando CAMPO POR CAMPO explicitamente:
            uuid: rawData.uuid,
            token_code: rawData.token_code,
            user_info_uuid: rawData.user_info_uuid,
            user_item_uuid: rawData.user_item_uuid,
            status: rawData.status,
            expires_at: rawData.expires_at,
            activated_at: rawData.activated_at,
            last_accessed_at: rawData.last_accessed_at,
            last_used_at: rawData.last_used_at,
            sequence_number: rawData.sequence_number,
            created_at: rawData.created_at,
            updated_at: rawData.updated_at,
        };
    });

    // Passa o array de objetos mapeados explicitamente para o Prisma
    const createdPrismaTokens = await prismaClient.offlineToken.createManyAndReturn({
        data: prismaCreateInputData,
    });

    // Mapeia os objetos do Prisma de volta para entidades (Hidratação)
    return createdPrismaTokens.map((prismaToken) =>
        OfflineTokenEntity.hydrate({
            uuid: new Uuid(prismaToken.uuid),
            token_code: prismaToken.token_code,
            user_info_uuid: new Uuid(prismaToken.user_info_uuid),
            user_item_uuid: new Uuid(prismaToken.user_item_uuid),
            status: prismaToken.status, // O Prisma já retorna o tipo correto do Enum aqui
            expires_at: prismaToken.expires_at,
            activated_at: prismaToken.activated_at,
            last_accessed_at: prismaToken.last_accessed_at,
            last_used_at: prismaToken.last_used_at,
            sequence_number: prismaToken.sequence_number,
            created_at: prismaToken.created_at,
            updated_at: prismaToken.updated_at,
        })
    );
}
    async findByTokenCode(
        tokenCode: string
    ): Promise<OfflineTokenEntity | null> {
        const token = await prismaClient.offlineToken.findUnique({
            where: {
                token_code: tokenCode,
            },
        });
        if (!token) return null;
        const returnData: OfflineTokenProps = {
            uuid: new Uuid(token.uuid),
            token_code: token.token_code,
            user_info_uuid: new Uuid(token.user_info_uuid),
            user_item_uuid: new Uuid(token.user_item_uuid),
            status: token.status,
            expires_at: token.expires_at,
            activated_at: token.activated_at,
            last_accessed_at: token.last_accessed_at,
            last_used_at: token.last_used_at,
            sequence_number: token.sequence_number,
            created_at: token.created_at,
            updated_at: token.updated_at,
        };

        return OfflineTokenEntity.hydrate(returnData);
    }
    async findByUserItem(
        userInfoUuid: Uuid,
        userItemUuid?: Uuid, // Opcional
        status?: OfflineTokenStatus
    ): Promise<OfflineTokenEntity[]> {
        const whereClause: any = {
            user_info_uuid: userInfoUuid.uuid,
        };

        if (userItemUuid) {
            whereClause.user_item_uuid = userItemUuid.uuid;
        }
        if (status) {
            whereClause.status = status;
        }

        const prismaTokens = await prismaClient.offlineToken.findMany({
            where: whereClause,
        });

        return prismaTokens.map((prismaToken) =>
            OfflineTokenEntity.hydrate({
                uuid: new Uuid(prismaToken.uuid),
                token_code: prismaToken.token_code,
                user_info_uuid: new Uuid(prismaToken.user_info_uuid),
                user_item_uuid: new Uuid(prismaToken.user_item_uuid),
                status: prismaToken.status,
                expires_at: prismaToken.expires_at,
                activated_at: prismaToken.activated_at,
                last_accessed_at: prismaToken.last_accessed_at,
                last_used_at: prismaToken.last_used_at,
                sequence_number: prismaToken.sequence_number,
                created_at: prismaToken.created_at,
                updated_at: prismaToken.updated_at,
            })
        );
    }
    async delete(uuid: Uuid): Promise<OfflineTokenEntity | null> {
        const deletedPrismaToken = await prismaClient.offlineToken.delete({
            where: { uuid: uuid.uuid },
        });

        if (!deletedPrismaToken) {
            return null; // ou lançar um erro, dependendo da sua política
        }

        return OfflineTokenEntity.hydrate({
            uuid: new Uuid(deletedPrismaToken.uuid),
            token_code: deletedPrismaToken.token_code,
            user_info_uuid: new Uuid(deletedPrismaToken.user_info_uuid),
            user_item_uuid: new Uuid(deletedPrismaToken.user_item_uuid),
            status: deletedPrismaToken.status,
            expires_at: deletedPrismaToken.expires_at,
            activated_at: deletedPrismaToken.activated_at,
            last_accessed_at: deletedPrismaToken.last_accessed_at,
            last_used_at: deletedPrismaToken.last_used_at,
            sequence_number: deletedPrismaToken.sequence_number,
            created_at: deletedPrismaToken.created_at,
            updated_at: deletedPrismaToken.updated_at,
        });
    }
    deleteManyByUserItem(
        userInfoUuid: Uuid,
        userItemUuid: Uuid
    ): Promise<number> {
        throw new Error('Method not implemented.');
    }
    findExpiredOrConsumed(
        status: OfflineTokenStatus,
        expiredBefore?: Date
    ): Promise<OfflineTokenEntity[]> {
        throw new Error('Method not implemented.');
    }
    async existsByTokenCode(tokenCode: string): Promise<boolean> {
        const count = await prismaClient.offlineToken.count({
            where: { token_code: tokenCode },
        });
        return count > 0;
    }
    create(entity: OfflineTokenEntity): Promise<void> {
        throw new Error('Method not implemented.');
    }
    async update(entity: OfflineTokenEntity): Promise<void> {
        const dataToUpdate = entity.toJSON(); // Pega o objeto plano da entidade
        await prismaClient.offlineToken.update({
            where: { uuid: entity.uuid.uuid },
            data: dataToUpdate,
        });
    }
    find(id: Uuid): Promise<OfflineTokenEntity> {
        throw new Error('Method not implemented.');
    }
    findAll(): Promise<OfflineTokenEntity[]> {
        throw new Error('Method not implemented.');
    }
}
