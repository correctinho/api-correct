import { Uuid } from "../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../errors/custom.error";

export enum AppointmentStatus {
    SCHEDULED = 'SCHEDULED', // Confirmado e aguardando a data
    COMPLETED = 'COMPLETED', // Serviço realizado (após check-in/job)
    CANCELED = 'CANCELED',   // Cancelado por alguma das partes
}

// Interface atualizada (sem suggestedSlotUuid)
export interface ConfirmedAppointmentProps {
    uuid?: Uuid;
    serviceRequestUuid: Uuid;
    startDatetime: Date; // Mapeia para 'final_scheduled_date' no banco
    status: AppointmentStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

export class ConfirmedAppointmentEntity {
    private _uuid: Uuid;
    private _serviceRequestUuid: Uuid;
    // REMOVIDO: private _suggestedSlotUuid: Uuid;
    private _startDatetime: Date;
    private _status: AppointmentStatus;
    private _createdAt: Date;
    private _updatedAt: Date;

    private constructor(props: ConfirmedAppointmentProps) {
        this._uuid = props.uuid ?? new Uuid();
        this._serviceRequestUuid = props.serviceRequestUuid;
        // REMOVIDO a atribuição do slot
        this._startDatetime = props.startDatetime;
        this._status = props.status;
        this._createdAt = props.createdAt ?? new Date();
        this._updatedAt = props.updatedAt ?? new Date();
    }

    // --- MÉTODOS DE FÁBRICA ---

    public static create(props: Omit<ConfirmedAppointmentProps, 'uuid' | 'status' | 'createdAt' | 'updatedAt'>): ConfirmedAppointmentEntity {
        if (props.startDatetime < new Date()) {
             // throw new CustomError("Não é possível confirmar um agendamento no passado.", 400);
        }

        return new ConfirmedAppointmentEntity({
            ...props,
            status: AppointmentStatus.SCHEDULED,
        });
    }

    public static hydrate(props: ConfirmedAppointmentProps): ConfirmedAppointmentEntity {
        if (!props.uuid) throw new CustomError("UUID necessário para hidratar ConfirmedAppointment.", 500);
        return new ConfirmedAppointmentEntity(props);
    }

    // --- MÉTODOS DE NEGÓCIO (Sem alterações) ---
    public markAsCompleted(): void {
        if (this._status !== AppointmentStatus.SCHEDULED) {
            throw new CustomError(`Apenas agendamentos 'SCHEDULED' podem ser marcados como 'COMPLETED'. Status atual: ${this._status}`, 400);
        }
        this._status = AppointmentStatus.COMPLETED;
        this.touch();
    }

    public cancel(reason?: string): void {
        if (this._status === AppointmentStatus.COMPLETED) {
            throw new CustomError("Não é possível cancelar um serviço já concluído.", 400);
        }
        if (this._status === AppointmentStatus.CANCELED) {
             throw new CustomError("Este agendamento já está cancelado.", 400);
        }
        this._status = AppointmentStatus.CANCELED;
        this.touch();
    }

    private touch(): void {
        this._updatedAt = new Date();
    }

    // --- GETTERS (Atualizados) ---
    get uuid(): Uuid { return this._uuid; }
    get serviceRequestUuid(): Uuid { return this._serviceRequestUuid; }
    // REMOVIDO GETTER DO SLOT
    get startDatetime(): Date { return this._startDatetime; }
    get status(): AppointmentStatus { return this._status; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }

    // --- SERIALIZAÇÃO (Atualizada para bater com o DTO/Banco) ---
    public toJSON() {
        return {
            uuid: this._uuid.uuid,
            service_request_uuid: this._serviceRequestUuid.uuid,
            // REMOVIDO suggested_slot_uuid
            start_datetime: this._startDatetime, // Será mapeado para final_scheduled_date
            status: this._status,
            created_at: this._createdAt,
            updated_at: this._updatedAt,
        };
    }
}