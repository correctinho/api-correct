import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { prismaClient } from '../../../../../infra/databases/prisma.config';
import {
    AppUserItemEntity,
    AppUserItemProps,
} from '../../entities/app-user-item.entity';
import { OutputFindAllAppUserItemsDTO } from '../../usecases/UserItem/find-all-by-employer/dto/find-user-item.dto';
import { IAppUserItemRepository } from '../app-user-item-repository';

export class AppUserItemPrismaRepository implements IAppUserItemRepository {
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
        await prismaClient.userItem.update({
            where: {
                uuid: entity.uuid.uuid,
            },
            data: {
                uuid: entity.uuid.uuid,
                user_info_uuid: entity.user_info_uuid.uuid,
                item_uuid: entity.item_uuid.uuid,
                item_name: entity.item_name,
                balance: entity.balance,
                status: entity.status,
                blocked_at: entity.blocked_at,
                cancelled_at: entity.cancelled_at,
                block_reason: entity.block_reason,
                cancel_reason: entity.cancel_reason,
                cancelling_request_at: entity.cancelling_request_at,
                grace_period_end_date: entity.grace_period_end_date,
                updated_at: entity.updated_at,
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
