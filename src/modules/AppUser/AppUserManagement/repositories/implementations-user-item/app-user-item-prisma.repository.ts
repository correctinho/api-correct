import { UserItemEventType, UserItemStatus } from '@prisma/client';
import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { prismaClient } from '../../../../../infra/databases/prisma.config';
import {
    AppUserItemEntity,
    AppUserItemProps,
} from '../../entities/app-user-item.entity';
import { OutputFindAllAppUserItemsDTO } from '../../usecases/UserItem/find-all-by-employer/dto/find-user-item.dto';
import { IAppUserItemRepository } from '../app-user-item-repository';
import { newDateF } from '../../../../../utils/date';

export class AppUserItemPrismaRepository implements IAppUserItemRepository {
    // Implementação do método transacional para atualização
    async updateBalanceAndHistory(
        userItemUuid: string,
        newBalanceInCents: number,
        previousBalanceInCents: number,
        transactionUuid: string | null, // Pode ser o UUID da transação de depósito do empregador
        eventType: UserItemEventType
    ): Promise<void> {
        await prismaClient.$transaction(async (tx) => {
            // 1. Atualizar o saldo do UserItem
            await tx.userItem.update({
                where: { uuid: userItemUuid },
                data: {
                    balance: newBalanceInCents,
                    updated_at: newDateF(new Date()),
                },
            });

            // 2. Criar o registro de histórico
            await tx.userItemHistory.create({
                data: {
                    user_item_uuid: userItemUuid,
                    event_type: eventType,
                    amount: newBalanceInCents - previousBalanceInCents, // O valor que foi 'adicionado' ou 'alterado'
                    balance_before: previousBalanceInCents,
                    balance_after: newBalanceInCents,
                    related_transaction_uuid: transactionUuid, // Pode ser null ou o UUID do depósito
                },
            });
        });
    }
    async findUserItemsWithBenefitGroupsByEmployerAndUserInfoIds(
        employerUuid: string,
        userInfoUuids: string[]
    ): Promise<AppUserItemEntity[]> {
        const userItemsData = await prismaClient.userItem.findMany({
            where: {
                // Filtra por empregador E pela lista de user_info_uuids
                business_info_uuid: employerUuid,
                user_info_uuid: { in: userInfoUuids },
                status: UserItemStatus.active, // Exemplo
            },
            include: {
               BenefitGroups: true,
               Item: true
            },
        });

        if (userItemsData.length === 0) {
            return [];
        }

        // Mapeie os resultados do Prisma para suas AppUserItemEntity
        return userItemsData.map((userItem) => {
            const itemProps: AppUserItemProps = {
                uuid: new Uuid(userItem.uuid),
                user_info_uuid: new Uuid(userItem.user_info_uuid), // Ajuste aqui se user_info_uuid não for o app_user_uuid diretamente
                business_info_uuid: new Uuid(userItem.business_info_uuid), // Adicione este se UserItem tiver employer_uuid
                balance: userItem.balance,
                item_name: userItem.item_name,
                item_type: userItem.Item.item_type,
                item_category: userItem.Item.item_category,
                item_uuid: new Uuid(userItem.item_uuid),
                status: userItem.status,
                group_uuid: userItem.BenefitGroups ? new Uuid(userItem.BenefitGroups.uuid) : null,
                group_name: userItem.BenefitGroups ? userItem.BenefitGroups.group_name : null, 
                group_value: userItem.BenefitGroups ? userItem.BenefitGroups.value : null,
                group_is_default: userItem.BenefitGroups ? userItem.BenefitGroups.is_default : null, // Assumindo 'is_default' no BenefitGroups
                created_at: userItem.created_at,
                updated_at: userItem.updated_at,
            };
            return AppUserItemEntity.hydrate(itemProps);
        });
    }
    async findAllUserItemsByEmployer(
        userInfoId: string,
        businessInfoId: string
    ): Promise<AppUserItemEntity[] | []> {
        const userItemsData = await prismaClient.userItem.findMany({
            where: {
                user_info_uuid: userInfoId,
                business_info_uuid: businessInfoId,
            },
            include: {
                Item: true,
                Business: true, // Incluímos o BusinessInfo completo
                BenefitGroups: true,
            },
        });

        if (userItemsData.length === 0) {
            return [];
        }

        // Usamos .map para "hidratar" cada resultado em uma instância de classe real
        return userItemsData.map((userItem) => {
            const itemProps: AppUserItemProps = {
                uuid: new Uuid(userItem.uuid),
                business_info_uuid: userItem.Business
                    ? new Uuid(userItem.Business.uuid)
                    : null,
                fantasy_name: userItem.Business
                    ? userItem.Business.fantasy_name
                    : null,
                user_info_uuid: new Uuid(userItem.user_info_uuid),
                item_uuid: new Uuid(userItem.item_uuid),
                item_type: userItem.Item.item_type,
                item_category: userItem.Item.item_category,
                img_url: userItem.Item.img_url,
                item_name: userItem.item_name,
                balance: userItem.balance,
                status: userItem.status,
                blocked_at: userItem.blocked_at,
                cancelled_at: userItem.cancelled_at,
                block_reason: userItem.block_reason,
                cancel_reason: userItem.cancel_reason,
                cancelling_request_at: userItem.cancelling_request_at,
                grace_period_end_date: userItem.grace_period_end_date,
                group_uuid: userItem.BenefitGroups
                    ? new Uuid(userItem.BenefitGroups.uuid)
                    : null,
                group_name: userItem.BenefitGroups
                    ? userItem.BenefitGroups.group_name
                    : null,
                group_value: userItem.BenefitGroups
                    ? userItem.BenefitGroups.value
                    : null,
                group_is_default: userItem.BenefitGroups
                    ? userItem.BenefitGroups.is_default
                    : null,
                created_at: userItem.created_at,
                updated_at: userItem.updated_at,
            };
            return AppUserItemEntity.hydrate(itemProps);
        });
    }
    async findDebitUserItem(
        userInfoId: string
    ): Promise<AppUserItemEntity | null> {
        const userItemData = await prismaClient.userItem.findFirst({
            where: {
                item_name: 'Correct',
                user_info_uuid: userInfoId,
            },
            include: {
                Item: true,
                BenefitGroups: true,
            },
        });

        if (!userItemData) return null;
        const userItemProps: AppUserItemProps = {
            uuid: new Uuid(userItemData.uuid),
            user_info_uuid: new Uuid(userItemData.user_info_uuid),
            business_info_uuid: userItemData.business_info_uuid
                ? new Uuid(userItemData.business_info_uuid)
                : null,
            item_uuid: new Uuid(userItemData.item_uuid),
            item_name: userItemData.item_name,
            item_category: userItemData.Item.item_category,
            balance: userItemData.balance, // O valor já vem em centavos do banco
            status: userItemData.status,
            group_uuid: userItemData.group_uuid
                ? new Uuid(userItemData.group_uuid)
                : null,
            // Incluímos os dados do grupo, que são parte do estado da entidade
            group_name: userItemData.BenefitGroups?.group_name,
            group_value: userItemData.BenefitGroups?.value,
            group_is_default: userItemData.BenefitGroups?.is_default,
            // Incluímos outros campos importantes que a entidade precisa
            img_url: userItemData.Item.img_url,
            cancelled_at: userItemData.cancelled_at,
            blocked_at: userItemData.blocked_at,
            block_reason: userItemData.block_reason,
            cancel_reason: userItemData.cancel_reason,
            cancelling_request_at: userItemData.cancelling_request_at,
            grace_period_end_date: userItemData.grace_period_end_date,
            created_at: userItemData.created_at,
            updated_at: userItemData.updated_at,
        };

        // 2. Usamos o método de fábrica `hydrate` para reconstruir a entidade.
        return AppUserItemEntity.hydrate(userItemProps);
    }

    async findByItemUuidAndUserInfo(
        userInfoId: string,
        itemId: string
    ): Promise<AppUserItemEntity | null> {
        const userItemData = await prismaClient.userItem.findFirst({
            where: {
                item_uuid: itemId,
                user_info_uuid: userInfoId,
            },
            include: {
                Item: true,
                BenefitGroups: true,
            },
        });

        if (!userItemData) return null;
        const userItemProps: AppUserItemProps = {
            uuid: new Uuid(userItemData.uuid),
            user_info_uuid: new Uuid(userItemData.user_info_uuid),
            business_info_uuid: userItemData.business_info_uuid
                ? new Uuid(userItemData.business_info_uuid)
                : null,
            item_uuid: new Uuid(userItemData.item_uuid),
            item_name: userItemData.item_name,
            item_category: userItemData.Item.item_category,
            balance: userItemData.balance, // O valor já vem em centavos do banco
            status: userItemData.status,
            group_uuid: userItemData.group_uuid
                ? new Uuid(userItemData.group_uuid)
                : null,
            // Incluímos os dados do grupo, que são parte do estado da entidade
            group_name: userItemData.BenefitGroups?.group_name,
            group_value: userItemData.BenefitGroups?.value,
            group_is_default: userItemData.BenefitGroups?.is_default,
            // Incluímos outros campos importantes que a entidade precisa
            img_url: userItemData.Item.img_url,
            cancelled_at: userItemData.cancelled_at,
            blocked_at: userItemData.blocked_at,
            block_reason: userItemData.block_reason,
            cancel_reason: userItemData.cancel_reason,
            cancelling_request_at: userItemData.cancelling_request_at,
            grace_period_end_date: userItemData.grace_period_end_date,
            created_at: userItemData.created_at,
            updated_at: userItemData.updated_at,
        };

        // 2. Usamos o método de fábrica `hydrate` para reconstruir a entidade.
        return AppUserItemEntity.hydrate(userItemProps);
    }

    async findItemByEmployeeAndBusiness(
        userInfoId: string,
        business_info_uuid: string,
        itemId: string
    ): Promise<AppUserItemEntity | null> {
        const userItemData = await prismaClient.userItem.findFirst({
            where: {
                business_info_uuid: business_info_uuid,
                user_info_uuid: userInfoId,
                item_uuid: itemId,
            },
            include: {
                Item: true,
                BenefitGroups: true,
            },
        });

        if (!userItemData) return null;

        const userItemProps: AppUserItemProps = {
            uuid: new Uuid(userItemData.uuid),
            user_info_uuid: new Uuid(userItemData.user_info_uuid),
            business_info_uuid: userItemData.business_info_uuid
                ? new Uuid(userItemData.business_info_uuid)
                : null,
            item_uuid: new Uuid(userItemData.item_uuid),
            item_name: userItemData.item_name,
            item_category: userItemData.Item.item_category,
            balance: userItemData.balance, // O valor já vem em centavos do banco
            status: userItemData.status,
            group_uuid: userItemData.group_uuid ? new Uuid(userItemData.group_uuid) : null,
            // Incluímos os dados do grupo, que são parte do estado da entidade
            group_name: userItemData.BenefitGroups?.group_name,
            group_value: userItemData.BenefitGroups?.value,
            group_is_default: userItemData.BenefitGroups?.is_default,
            // Incluímos outros campos importantes que a entidade precisa
            img_url: userItemData.Item.img_url,
            cancelled_at: userItemData.cancelled_at,
            blocked_at: userItemData.blocked_at,
            block_reason: userItemData.block_reason,
            cancel_reason: userItemData.cancel_reason,
            cancelling_request_at: userItemData.cancelling_request_at,
            grace_period_end_date: userItemData.grace_period_end_date,
            created_at: userItemData.created_at,
            updated_at: userItemData.updated_at,
        };

        // 2. Usamos o método de fábrica `hydrate` para reconstruir a entidade.
        return AppUserItemEntity.hydrate(userItemProps);
    }
    async create(entity: AppUserItemEntity): Promise<void> {
        await prismaClient.userItem.create({
            data: {
                uuid: entity.uuid.uuid,
                user_info_uuid: entity.user_info_uuid.uuid,
                business_info_uuid: entity.business_info_uuid.uuid,
                item_uuid: entity.item_uuid.uuid,
                item_name: entity.item_name,
                balance: entity.balance,
                group_uuid: entity.group_uuid.uuid,
                status: entity.status,
                blocked_at: entity.blocked_at,
                cancelled_at: entity.cancelled_at,
                block_reason: entity.block_reason,
                cancel_reason: entity.cancel_reason,
                grace_period_end_date: entity.grace_period_end_date,
                created_at: entity.created_at,
            },
        });
    }
    async update(entity: AppUserItemEntity): Promise<void> {
        const dataToSave = entity.toJSON()
        await prismaClient.userItem.update({
            where: {
                uuid: dataToSave.uuid,
            },
            data: {
                uuid: dataToSave.uuid,
                user_info_uuid: dataToSave.user_info_uuid,
                group_uuid: dataToSave.group_uuid,
                item_uuid: dataToSave.item_uuid,
                item_name: dataToSave.item_name,
                balance: dataToSave.balance,
                status: dataToSave.status,
                blocked_at: dataToSave.blocked_at,
                cancelled_at: dataToSave.cancelled_at,
                block_reason: dataToSave.block_reason,
                cancel_reason: dataToSave.cancel_reason,
                cancelling_request_at: dataToSave.cancelling_request_at,
                grace_period_end_date: dataToSave.grace_period_end_date,
                updated_at: dataToSave.updated_at,
            },
        });
    }
    async find(id: Uuid): Promise<AppUserItemEntity | null> {
        const userItemData = await prismaClient.userItem.findUnique({
            where: {
                uuid: id.uuid,
            },
            include: {
                Item: true,
                BenefitGroups: true,
                Business: true,
            },
        });

        if (!userItemData) {
            return null;
        }

        // 1. Mapeamos os dados brutos do Prisma para o formato `AppUserItemProps`.
        //    Isso garante que todos os dados necessários para a entidade sejam fornecidos.
        const userItemProps: AppUserItemProps = {
            uuid: new Uuid(userItemData.uuid),
            user_info_uuid: new Uuid(userItemData.user_info_uuid),
            business_info_uuid: userItemData.business_info_uuid
                ? new Uuid(userItemData.business_info_uuid)
                : null,
            item_uuid: new Uuid(userItemData.item_uuid),
            item_name: userItemData.item_name,
            item_category: userItemData.Item.item_category,
            balance: userItemData.balance, // O valor já vem em centavos do banco
            status: userItemData.status,
            group_uuid: userItemData.group_uuid
                ? new Uuid(userItemData.group_uuid)
                : null,
            // Incluímos os dados do grupo, que são parte do estado da entidade
            group_name: userItemData.BenefitGroups?.group_name,
            group_value: userItemData.BenefitGroups?.value,
            group_is_default: userItemData.BenefitGroups?.is_default,
            // Incluímos outros campos importantes que a entidade precisa
            img_url: userItemData.Item.img_url,
            cancelled_at: userItemData.cancelled_at,
            blocked_at: userItemData.blocked_at,
            block_reason: userItemData.block_reason,
            cancel_reason: userItemData.cancel_reason,
            cancelling_request_at: userItemData.cancelling_request_at,
            grace_period_end_date: userItemData.grace_period_end_date,
            created_at: userItemData.created_at,
            updated_at: userItemData.updated_at,
        };

        // 2. Usamos o método de fábrica `hydrate` para reconstruir a entidade.
        return AppUserItemEntity.hydrate(userItemProps);
    }
    findAll(): Promise<AppUserItemEntity[]> {
        throw new Error('Method not implemented.');
    }

    async findAllUserItems(userInfoId: string): Promise<AppUserItemEntity[]> {
        const userItemsData = await prismaClient.userItem.findMany({
            where: {
                user_info_uuid: userInfoId,
            },
            include: {
                Item: true,
                Business: true, // Incluímos o BusinessInfo completo
                BenefitGroups: true,
            },
        });
        if (userItemsData.length === 0) {
            return [];
        }

        // Usamos .map para "hidratar" cada resultado em uma instância de classe real
        return userItemsData.map((userItem) => {
            const itemProps: AppUserItemProps = {
                uuid: new Uuid(userItem.uuid),
                business_info_uuid: userItem.Business
                    ? new Uuid(userItem.Business.uuid)
                    : null,
                fantasy_name: userItem.Business
                    ? userItem.Business.fantasy_name
                    : null,
                user_info_uuid: new Uuid(userItem.user_info_uuid),
                item_uuid: new Uuid(userItem.item_uuid),
                item_type: userItem.Item.item_type,
                item_category: userItem.Item.item_category,
                img_url: userItem.Item.img_url,
                item_name: userItem.item_name,
                balance: userItem.balance,
                status: userItem.status,
                blocked_at: userItem.blocked_at,
                cancelled_at: userItem.cancelled_at,
                block_reason: userItem.block_reason,
                cancel_reason: userItem.cancel_reason,
                cancelling_request_at: userItem.cancelling_request_at,
                grace_period_end_date: userItem.grace_period_end_date,
                group_uuid: userItem.BenefitGroups
                    ? new Uuid(userItem.BenefitGroups.uuid)
                    : null,
                group_name: userItem.BenefitGroups
                    ? userItem.BenefitGroups.group_name
                    : null,
                group_value: userItem.BenefitGroups
                    ? userItem.BenefitGroups.value
                    : null,
                group_is_default: userItem.BenefitGroups
                    ? userItem.BenefitGroups.is_default
                    : null,
                created_at: userItem.created_at,
                updated_at: userItem.updated_at,
            };
            return AppUserItemEntity.hydrate(itemProps);
        });
    }
}
