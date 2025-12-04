import { PrismaClient } from '@prisma/client';
import { IServiceRequestRepository } from '../IServiceRequestRepository';
import {
    ServiceRequestEntity,
    RequestStatus,
    RequestedWindowProps,
    SuggestedSlotProps,
} from '../../entities/ServiceRequest.entity';
import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo';
import { prismaClient } from '../../../../infra/databases/prisma.config';

export class ServiceRequestPrismaRepository
    implements IServiceRequestRepository
{
    async countPendingByBusiness(businessUuid: Uuid): Promise<number> {
        const count = await prismaClient.serviceRequest.count({
            where: {
                business_info_uuid: businessUuid.uuid,
                status: RequestStatus.PENDING_PROVIDER_OPTIONS,
            },
        });
        return count;
    }
    
    async findPendingByBusiness(
        businessUuid: Uuid
    ): Promise<ServiceRequestEntity[]> {
        // 1. Busca no banco com filtros e includes
        const rawRequests = await prismaClient.serviceRequest.findMany({
            where: {
                // Filtra pela empresa
                business_info_uuid: businessUuid.uuid,
                // Filtra APENAS pelo status inicial de espera
                status: RequestStatus.PENDING_PROVIDER_OPTIONS,
            },
            include: {
                // Traz os relacionamentos necessários para hidratar a entidade
                RequestedWindows: true,
                SuggestedSlots: true,
                UserInfo: true,
                Product: true,
            },
            orderBy: {
                created_at: 'asc', // Opcional: Ordena pelos mais antigos primeiro
            },
        });

        // 2. Mapeia os resultados crus do Prisma para Entidades de Domínio
        // usando o helper privado 'hydrate'.
        return rawRequests.map((raw) => this.hydrate(raw));
    }
    // Assumindo que o prismaClient é injetado ou importado globalmente. Ajuste conforme seu projeto.
    findAll(): Promise<ServiceRequestEntity[]> {
        throw new Error('Method not implemented.');
    }

    async create(entity: ServiceRequestEntity): Promise<void> {
        const data = entity.toJSON();

        // A mágica do Prisma: salvando o pai e os filhos (janelas) de uma vez.
        await prismaClient.serviceRequest.create({
            data: {
                uuid: data.uuid,
                user_info_uuid: data.user_info_uuid,
                business_info_uuid: data.business_info_uuid,
                product_uuid: data.product_uuid,
                status: data.status as RequestStatus,
                created_at: data.created_at,
                updated_at: data.updated_at,

                // NESTED WRITE: Cria as janelas associadas nessa mesma transação
                RequestedWindows: {
                    createMany: {
                        data: data.requested_windows.map((window) => ({
                            // O uuid da window será gerado automaticamente pelo banco se não passarmos,
                            // ou podemos gerar um Uuid() aqui se precisarmos do ID antes de salvar.
                            // Vamos deixar o banco gerar por simplicidade por enquanto.
                            date: window.date,
                            period: window.period,
                        })),
                    },
                },
                // Nota: Na criação (Passo 1), ainda não existem SuggestedSlots.
            },
        });
    }

    async find(uuid: Uuid): Promise<ServiceRequestEntity | null> {
        const raw = await prismaClient.serviceRequest.findUnique({
            where: { uuid: uuid.uuid },
            // EAGER LOADING: Traz os filhos juntos
            include: {
                RequestedWindows: true,
                SuggestedSlots: true,
            },
        });

        if (!raw) return null;

        return this.hydrate(raw);
    }

    async update(entity: ServiceRequestEntity): Promise<void> {
        const data = entity.toJSON();

        // A lógica de update é delicada. Precisamos lidar com a adição de novos slots.
        // Uma abordagem segura para este fluxo específico (onde slots só são adicionados, nunca removidos ou editados)
        // é usar o 'upsert' nos slots aninhados.

        await prismaClient.serviceRequest.update({
            where: { uuid: data.uuid },
            data: {
                status: data.status as RequestStatus,
                updated_at: new Date(), // Força atualização da data

                // Atualiza/Cria slots sugeridos (Passo 2)
                SuggestedSlots: {
                    upsert: data.suggested_slots.map((slot) => ({
                        where: { uuid: slot.uuid ?? 'new-uuid-placeholder' }, // Se não tiver UUID, é novo
                        update: {
                            is_selected: slot.is_selected, // Passo 3: atualiza se foi selecionado
                        },
                        create: {
                            // Se é um slot novo sendo sugerido
                            // Se o slot.uuid vier do toJSON (gerado na entidade), usamos ele. Se não, o banco gera.
                            ...(slot.uuid ? { uuid: slot.uuid } : {}),
                            start_datetime: slot.start_datetime,
                            is_selected: slot.is_selected,
                        },
                    })),
                },
                // Nota: RequestedWindows não mudam após a criação, então não precisamos mexer nelas no update.
            },
        });
    }

    // Helper para converter dados crus do Prisma para a Entidade de Domínio
    private hydrate(raw: any): ServiceRequestEntity {
        const requestedWindows: RequestedWindowProps[] =
            raw.RequestedWindows.map((rw: any) => ({
                date: rw.date,
                period: rw.period as 'MORNING' | 'AFTERNOON' | 'EVENING',
            }));

        const suggestedSlots: SuggestedSlotProps[] = raw.SuggestedSlots.map(
            (ss: any) => ({
                uuid: new Uuid(ss.uuid),
                startDatetime: ss.start_datetime,
                isSelected: ss.is_selected,
            })
        );

        return ServiceRequestEntity.hydrate({
            uuid: new Uuid(raw.uuid),
            userInfoUuid: new Uuid(raw.user_info_uuid),
            businessInfoUuid: new Uuid(raw.business_info_uuid),
            productUuid: new Uuid(raw.product_uuid),
            status: raw.status as RequestStatus,
            requestedWindows: requestedWindows,
            suggestedSlots: suggestedSlots,
            createdAt: raw.created_at,
            updatedAt: raw.updated_at,
        });
    }
}
