import { PrismaClient } from "@prisma/client";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../errors/custom.error";
// Imports das Entidades e Enums
import { AppointmentStatus, ConfirmedAppointmentEntity } from "../../entities/ConfirmedAppointment.entity";
import { RequestStatus } from "../../entities/ServiceRequest.entity";
// Import da Interface
import { IConfirmedAppointmentRepository } from "../IConfirmedAppointmentRepository";
// Client Prisma Global
import { prismaClient } from "../../../../infra/databases/prisma.config";

export class ConfirmedAppointmentPrismaRepository implements IConfirmedAppointmentRepository {
    create(entity: ConfirmedAppointmentEntity): Promise<void> {
        throw new Error("Method not implemented.");
    }
    update(entity: ConfirmedAppointmentEntity): Promise<void> {
        throw new Error("Method not implemented.");
    }
    find(id: Uuid): Promise<ConfirmedAppointmentEntity> {
        throw new Error("Method not implemented.");
    }
    findAll(): Promise<ConfirmedAppointmentEntity[]> {
        throw new Error("Method not implemented.");
    }

    async findByRequestId(serviceRequestUuid: Uuid): Promise<ConfirmedAppointmentEntity | null> {
        const raw = await prismaClient.confirmedAppointment.findUnique({
            where: {
                // Como a relação é 1:1, podemos buscar direto por este campo
                service_request_uuid: serviceRequestUuid.uuid
            }
        });

        if (!raw) {
            return null;
        }

        return this.hydrate(raw);
    }
    async confirm(serviceRequestUuid: Uuid, selectedSlotUuid: Uuid): Promise<ConfirmedAppointmentEntity> {
        const resultEntity = await prismaClient.$transaction(async (tx) => {

            // 1. Buscar a Solicitação e verificar se o slot pertence a ela.
            // (Essa parte não muda, precisamos achar o slot para pegar a data dele)
            const requestWithSlot = await tx.serviceRequest.findUnique({
                where: { uuid: serviceRequestUuid.uuid },
                include: {
                    SuggestedSlots: {
                        where: { uuid: selectedSlotUuid.uuid }
                    }
                }
            });

            // --- VALIDAÇÕES ---
            if (!requestWithSlot) {
                throw new CustomError("Solicitação de serviço não encontrada.", 404);
            }
            if (requestWithSlot.status !== RequestStatus.PENDING_USER_SELECTION) {
                 throw new CustomError(`Não é possível confirmar esta solicitação. Status atual: ${requestWithSlot.status}`, 409);
            }
            if (requestWithSlot.SuggestedSlots.length === 0) {
                throw new CustomError("O horário selecionado não é válido para esta solicitação.", 400);
            }

            // Pegamos os dados do slot escolhido (precisamos da data dele!)
            const selectedSlotData = requestWithSlot.SuggestedSlots[0];

            // --- OPERAÇÕES DE ESCRITA ---

            // 2. Atualizar o Slot Sugerido (Marca como selecionado)
            await tx.suggestedSlot.update({
                where: { uuid: selectedSlotUuid.uuid },
                data: { is_selected: true }
            });

            // 3. Atualizar o status da Solicitação pai para CONFIRMED
            await tx.serviceRequest.update({
                where: { uuid: serviceRequestUuid.uuid },
                data: { status: RequestStatus.CONFIRMED }
            });

            // 4. Criar o Agendamento Confirmado final
            // A fábrica da entidade não muda, ela recebe a data de início.
            const newAppointmentEntity = ConfirmedAppointmentEntity.create({
                serviceRequestUuid: serviceRequestUuid,
                // REMOVIDO: suggestedSlotUuid: selectedSlotUuid,
                startDatetime: selectedSlotData.start_datetime, // Usamos a data do slot
            });

            // --- CORREÇÃO CRÍTICA AQUI NO MAPEAMENTO PARA O PRISMA ---
            const createdRaw = await tx.confirmedAppointment.create({
                data: {
                    uuid: newAppointmentEntity.uuid.uuid,
                    service_request_uuid: newAppointmentEntity.serviceRequestUuid.uuid,
                    // REMOVIDO: suggested_slot_uuid

                    // MAPEAMENTO CORRETO: startDatetime da entidade -> final_scheduled_date do banco
                    final_scheduled_date: newAppointmentEntity.startDatetime,

                    status: newAppointmentEntity.status,
                    created_at: newAppointmentEntity.createdAt,
                    updated_at: newAppointmentEntity.updatedAt,
                }
            });

            return this.hydrate(createdRaw);
        });

        return resultEntity;
    }

    // Helper hydrate corrigido
    private hydrate(raw: any): ConfirmedAppointmentEntity {
        return ConfirmedAppointmentEntity.hydrate({
            uuid: new Uuid(raw.uuid),
            serviceRequestUuid: new Uuid(raw.service_request_uuid),
            // REMOVIDO suggestedSlotUuid
            // MAPEAMENTO CORRETO NO HYDRATE TAMBÉM
            startDatetime: raw.final_scheduled_date, // Lê da coluna certa do banco
            status: raw.status as AppointmentStatus,
            createdAt: raw.created_at,
            updatedAt: raw.updated_at
        });
    }
}