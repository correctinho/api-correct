import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { prismaClient } from '../../../../../infra/databases/prisma.config';
import {
    BenefitGroupsEntity,
    BenefitGroupsProps,
} from '../../entities/benefit-groups.entity';
import { IBenefitGroupsRepository } from '../benefit-groups.repository';

export class BenefitGroupsPrismaRepository implements IBenefitGroupsRepository {
    async createReturn(
        data: BenefitGroupsEntity
    ): Promise<BenefitGroupsEntity> {
         const dataToPersist = data.toJSON();
        const group = await prismaClient.benefitGroups.create({
            data: {
                uuid: dataToPersist.uuid,
                group_name: dataToPersist.group_name,
                employer_item_details_uuid:
                    dataToPersist.employer_item_details_uuid,
                value: dataToPersist.value,
                is_default: dataToPersist.is_default,
                business_info_uuid: dataToPersist.business_info_uuid,
                created_at: dataToPersist.created_at,
            },
        });

        const groupEntity = BenefitGroupsEntity.hydrate({
            uuid: new Uuid(group.uuid),
            group_name: group.group_name,
            employer_item_details_uuid: new Uuid(group.employer_item_details_uuid),
            value: group.value,
            is_default: group.is_default,
            business_info_uuid: new Uuid(group.business_info_uuid),
            created_at: group.created_at,
            updated_at: group.updated_at,
        });

        return groupEntity;
    }
    async findAllByBusiness(
    business_info_uuid: string
): Promise<BenefitGroupsEntity[]> { // A anotação de tipo aqui já remove a necessidade do `| []`
    const groupsData = await prismaClient.benefitGroups.findMany({
        where: {
            business_info_uuid: business_info_uuid,
        },
    });

    if (groupsData.length === 0) {
        return [];
    }

    // 1. Mapeamos os dados brutos do Prisma para instâncias de classe reais.
    const groupEntities = groupsData.map((groupData) => {
        // Preparamos as props para a hidratação.
        const groupProps: BenefitGroupsProps = {
            uuid: new Uuid(groupData.uuid),
            group_name: groupData.group_name,
            employer_item_details_uuid: new Uuid(
                groupData.employer_item_details_uuid
            ),
            value: groupData.value, // O valor já vem em centavos do banco
            business_info_uuid: new Uuid(groupData.business_info_uuid),
            is_default: groupData.is_default,
            created_at: groupData.created_at,
            updated_at: groupData.updated_at,
        };

        // 2. Usamos o método de fábrica `hydrate` para reconstruir cada entidade.
        return BenefitGroupsEntity.hydrate(groupProps);
    });

    return groupEntities;
}
    async createOrUpdate(
        data: BenefitGroupsEntity
    ): Promise<BenefitGroupsEntity> {
        const group = await prismaClient.benefitGroups.upsert({
            where: {
                uuid: data.uuid.uuid,
            },
            create: {
                uuid: data.uuid.uuid,
                group_name: data.group_name,
                employer_item_details_uuid: data.employer_item_details_uuid.uuid,
                value: data.value,
                is_default: data.is_default,
                business_info_uuid: data.business_info_uuid.uuid,
                created_at: data.created_at,
            },
            update: {
                group_name: data.group_name,
                employer_item_details_uuid: data.employer_item_details_uuid.uuid,
                value: data.value,
                is_default: data.is_default,
                business_info_uuid: data.business_info_uuid.uuid,
                updated_at: data.updated_at,
            },
        });

        return {
            uuid: new Uuid(group.uuid),
            group_name: group.group_name,
            employer_item_details_uuid: new Uuid(
                group.employer_item_details_uuid
            ),
            value: group.value,
            business_info_uuid: new Uuid(group.business_info_uuid),
            is_default: group.is_default,
            created_at: group.created_at,
            updated_at: group.updated_at,
        } as BenefitGroupsEntity;
    }

    async findByNameAndDefault(
        group_name: string,
        is_default: boolean,
        business_info_uuid: string
    ): Promise<BenefitGroupsEntity | null> {
        const group = await prismaClient.benefitGroups.findFirst({
            where: {
                group_name,
                is_default,
                business_info_uuid,
            },
        });
        if (!group) return null;

        return {
            uuid: new Uuid(group.uuid),
            group_name: group.group_name,
            employer_item_details_uuid: new Uuid(
                group.employer_item_details_uuid
            ),
            value: group.value,
            business_info_uuid: new Uuid(group.business_info_uuid),
            is_default: group.is_default,
            created_at: group.created_at,
            updated_at: group.updated_at,
        } as BenefitGroupsEntity;
    }

    async create(entity: BenefitGroupsEntity): Promise<void> {
        throw new Error('Method not implemented.');
    }
    async update(entity: BenefitGroupsEntity): Promise<void> {
    // 1. Usamos entity.toJSON() para obter os dados brutos com o valor em CENTAVOS.
    const entityData = entity.toJSON();

    // 2. Usamos o método `update` do Prisma, pois a intenção é apenas atualizar.
    await prismaClient.benefitGroups.update({
        where: {
            uuid: entityData.uuid,
        },
        data: {
            group_name: entityData.group_name,
            value: entityData.value, 
            updated_at: entityData.updated_at,
        },
    });
}
    async find(id: Uuid): Promise<BenefitGroupsEntity | null> {
        const groupData = await prismaClient.benefitGroups.findUnique({
            where: {
                uuid: id.uuid,
            },
        });

        if (!groupData) {
            return null;
        }

        // 1. Mapeamos os dados brutos do Prisma para o formato `BenefitGroupsProps`.
        const groupProps: BenefitGroupsProps = {
            uuid: new Uuid(groupData.uuid),
            group_name: groupData.group_name,
            employer_item_details_uuid: new Uuid(
                groupData.employer_item_details_uuid
            ),
            value: groupData.value, // O valor já vem em centavos do banco
            business_info_uuid: new Uuid(groupData.business_info_uuid),
            is_default: groupData.is_default,
            created_at: groupData.created_at,
            updated_at: groupData.updated_at,
        };

        // 2. Usamos o método de fábrica `hydrate` para reconstruir a entidade.
        return BenefitGroupsEntity.hydrate(groupProps);
    }
    async findAll(): Promise<BenefitGroupsEntity[]> {
        throw new Error('Method not implemented.');
    }
}
