import { OfflineTokenStatus } from "@prisma/client";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { IOfflineTokenRepository } from "../offline-tokens.repository";
import { OfflineTokenEntity, OfflineTokenProps } from "../../entities/offline-token.entity";
import { prismaClient } from "../../../../../infra/databases/prisma.config";

export class OfflineTokensPrismaRepository implements IOfflineTokenRepository{
    async createMany(entities: OfflineTokenEntity[]): Promise<OfflineTokenEntity[]> {
    const data = entities.map(entity => entity.toJSON()); // Converte entidades para objetos planos
    const createdPrismaTokens = await prismaClient.offlineToken.createManyAndReturn({ data }); // Usar createManyAndReturn para obter os objetos criados
    
    // Mapeia os objetos do Prisma de volta para entidades
    return createdPrismaTokens.map(prismaToken => OfflineTokenEntity.hydrate({
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
    }));
  }
    async findByTokenCode(tokenCode: string): Promise<OfflineTokenEntity | null> {
      const token = await prismaClient.offlineToken.findUnique({
          where:{ 
            token_code: tokenCode
          }
        })
        if(!token) return null
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
          updated_at: token.updated_at
        }

        return OfflineTokenEntity.hydrate(returnData)
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

    return prismaTokens.map(prismaToken => OfflineTokenEntity.hydrate({
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
    }));
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
    deleteManyByUserItem(userInfoUuid: Uuid, userItemUuid: Uuid): Promise<number> {
        throw new Error("Method not implemented.");
    }
    findExpiredOrConsumed(status: OfflineTokenStatus, expiredBefore?: Date): Promise<OfflineTokenEntity[]> {
        throw new Error("Method not implemented.");
    }
    async existsByTokenCode(tokenCode: string): Promise<boolean> {
    const count = await prismaClient.offlineToken.count({
      where: { token_code: tokenCode },
    });
    return count > 0;
  }
    create(entity: OfflineTokenEntity): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async update(entity: OfflineTokenEntity): Promise<void> {
    const dataToUpdate = entity.toJSON(); // Pega o objeto plano da entidade
    await prismaClient.offlineToken.update({
      where: { uuid: entity.uuid.uuid },
      data: dataToUpdate,
    });
  }
    find(id: Uuid): Promise<OfflineTokenEntity> {
        throw new Error("Method not implemented.");
    }
    findAll(): Promise<OfflineTokenEntity[]> {
        throw new Error("Method not implemented.");
    }

}