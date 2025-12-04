import { Uuid } from "../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../errors/custom.error";

// Tipos auxiliares (Value Objects simples para janelas e slots)
export type RequestedWindowProps = {
    date: Date;
    period: 'MORNING' | 'AFTERNOON' | 'EVENING'; // Mapeia o enum do Prisma
}

export type SuggestedSlotProps = {
    uuid?: Uuid; // O slot pode ter ID se já veio do banco
    startDatetime: Date;
    isSelected?: boolean;
}

// Enum de Status (Deve bater com o Prisma)
export enum RequestStatus {
    PENDING_PROVIDER_OPTIONS = 'PENDING_PROVIDER_OPTIONS',
    PENDING_USER_SELECTION = 'PENDING_USER_SELECTION',
    CONFIRMED = 'CONFIRMED',
    DECLINED = 'DECLINED',
    EXPIRED = 'EXPIRED'
}

// Props para criar/hidratar a entidade
export type ServiceRequestProps = {
    uuid?: Uuid;
    userInfoUuid: Uuid;
    businessInfoUuid: Uuid;
    productUuid: Uuid;
    status: RequestStatus;
    requestedWindows: RequestedWindowProps[];
    suggestedSlots?: SuggestedSlotProps[];
    createdAt?: Date;
    updatedAt?: Date;
}

export class ServiceRequestEntity {
    private _uuid: Uuid;
    private _userInfoUuid: Uuid;
    private _businessInfoUuid: Uuid;
    private _productUuid: Uuid;
    private _status: RequestStatus;
    private _requestedWindows: RequestedWindowProps[];
    private _suggestedSlots: SuggestedSlotProps[];
    private _createdAt: Date;
    private _updatedAt: Date;

    private constructor(props: ServiceRequestProps) {
        this._uuid = props.uuid ?? new Uuid();
        this._userInfoUuid = props.userInfoUuid;
        this._businessInfoUuid = props.businessInfoUuid;
        this._productUuid = props.productUuid;
        this._status = props.status;
        this._requestedWindows = props.requestedWindows;
        this._suggestedSlots = props.suggestedSlots ?? [];
        this._createdAt = props.createdAt ?? new Date();
        this._updatedAt = props.updatedAt ?? new Date();
        this.validate();
    }

    // --- Getters ---
    get uuid(): Uuid { return this._uuid; }
    get userInfoUuid(): Uuid { return this._userInfoUuid; }
    get businessInfoUuid(): Uuid { return this._businessInfoUuid; }
    get productUuid(): Uuid { return this._productUuid; }
    get status(): RequestStatus { return this._status; }
    get requestedWindows(): RequestedWindowProps[] { return this._requestedWindows; }
    get suggestedSlots(): SuggestedSlotProps[] { return this._suggestedSlots; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }

    // --- Métodos de Negócio ---

    // Passo 2: Prestador sugere slots
    public suggestSlots(slots: Omit<SuggestedSlotProps, 'uuid' | 'isSelected'>[]) {
        if (this._status !== RequestStatus.PENDING_PROVIDER_OPTIONS) {
            throw new CustomError("Não é possível sugerir horários para esta solicitação no status atual.", 400);
        }
        if (slots.length === 0) {
            throw new CustomError("É necessário sugerir ao menos um horário.", 400);
        }
        // Adiciona os slots e muda o status
        this._suggestedSlots = slots.map(s => ({ ...s, isSelected: false }));
        this._status = RequestStatus.PENDING_USER_SELECTION;
        this.touch();
    }

    // Passo 3: Usuário confirma um slot
    public confirmSlot(slotUuidStr: string) {
         if (this._status !== RequestStatus.PENDING_USER_SELECTION) {
            throw new CustomError("Não é possível confirmar esta solicitação no status atual.", 400);
        }
        
        const slot = this._suggestedSlots.find(s => s.uuid?.uuid === slotUuidStr);
        if (!slot) {
             throw new CustomError("O horário selecionado não pertence a esta solicitação.", 404);
        }

        slot.isSelected = true;
        this._status = RequestStatus.CONFIRMED;
        this.touch();
        // Nota: O UseCase será responsável por criar a entidade ConfirmedAppointment
    }

    private touch() {
        this._updatedAt = new Date();
    }

    private validate() {
        if (this._requestedWindows.length === 0) {
            throw new CustomError("É necessário informar pelo menos uma janela de preferência.", 400);
        }
        // Adicionar outras validações se necessário
    }

    // Factory para criação inicial (Passo 1)
    public static create(props: Omit<ServiceRequestProps, 'uuid' | 'status' | 'createdAt' | 'updatedAt' | 'suggestedSlots'>): ServiceRequestEntity {
        return new ServiceRequestEntity({
            ...props,
            status: RequestStatus.PENDING_PROVIDER_OPTIONS,
            // O resto é inicializado no construtor
        });
    }

    // Factory para hidratar do banco
    public static hydrate(props: ServiceRequestProps): ServiceRequestEntity {
        return new ServiceRequestEntity(props);
    }

    public toJSON() {
        return {
            uuid: this._uuid.uuid,
            user_info_uuid: this._userInfoUuid.uuid,
            business_info_uuid: this._businessInfoUuid.uuid,
            product_uuid: this._productUuid.uuid,
            status: this._status,
            requested_windows: this._requestedWindows,
            suggested_slots: this._suggestedSlots.map(s => ({
                uuid: s.uuid?.uuid,
                start_datetime: s.startDatetime,
                is_selected: s.isSelected
            })),
            created_at: this._createdAt,
            updated_at: this._updatedAt
        }
    }
}