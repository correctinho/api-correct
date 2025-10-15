import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { OfflineTokenHistoryEventType, OfflineTokenStatus } from '@prisma/client';
import { CustomError } from "../../../../errors/custom.error";

export type OfflineTokenHistoryProps = {
  uuid?: Uuid;
  original_token_uuid?: Uuid | null;
  token_code: string;
  user_info_uuid: Uuid;
  user_item_uuid: Uuid;
  event_type: OfflineTokenHistoryEventType;
  event_description?: string | null;
  related_transaction_uuid?: Uuid | null;
  event_at?: Date;
  snapshot_expires_at?: Date | null;
  snapshot_status?: OfflineTokenStatus | null;
};

// NOVO TIPO: Interface para o que toJSON() realmente retorna
export type OfflineTokenHistoryToJSONOutput = {
  uuid: string;
  original_token_uuid: string | null;
  token_code: string;
  user_info_uuid: string;
  user_item_uuid: string;
  event_type: OfflineTokenHistoryEventType;
  event_description: string | null;
  related_transaction_uuid: string | null;
  event_at: Date;
  snapshot_expires_at: Date | null;
  snapshot_status: OfflineTokenStatus | null;
};


export class OfflineTokenHistoryEntity {
  private _uuid: Uuid;
  private _original_token_uuid: Uuid | null;
  private _token_code: string;
  private _user_info_uuid: Uuid;
  private _user_item_uuid: Uuid;
  private _event_type: OfflineTokenHistoryEventType;
  private _event_description: string | null;
  private _related_transaction_uuid: Uuid | null;
  private _event_at: Date;
  private _snapshot_expires_at: Date | null;
  private _snapshot_status: OfflineTokenStatus | null;

  private constructor(props: OfflineTokenHistoryProps) {
    this._uuid = props.uuid ?? new Uuid();
    this._original_token_uuid = props.original_token_uuid ?? null;
    this._token_code = props.token_code;
    this._user_info_uuid = props.user_info_uuid;
    this._user_item_uuid = props.user_item_uuid;
    this._event_type = props.event_type;
    this._event_description = props.event_description ?? null;
    this._related_transaction_uuid = props.related_transaction_uuid ?? null;
    this._event_at = props.event_at ?? new Date();
    this._snapshot_expires_at = props.snapshot_expires_at ?? null;
    this._snapshot_status = props.snapshot_status ?? null;
    this.validate(); // Valida no construtor
  }

  // --- Getters ---
  get uuid(): Uuid { return this._uuid; }
  get original_token_uuid(): Uuid | null { return this._original_token_uuid; }
  get token_code(): string { return this._token_code; }
  get user_info_uuid(): Uuid { return this._user_info_uuid; }
  get user_item_uuid(): Uuid { return this._user_item_uuid; }
  get event_type(): OfflineTokenHistoryEventType { return this._event_type; }
  get event_description(): string | null { return this._event_description; }
  get related_transaction_uuid(): Uuid | null { return this._related_transaction_uuid; }
  get event_at(): Date { return this._event_at; }
  get snapshot_expires_at(): Date | null { return this._snapshot_expires_at; }
  get snapshot_status(): OfflineTokenStatus | null { return this._snapshot_status; }

  // --- Validação Interna ---
  private validate(): void {
    if (!this._token_code || this._token_code.length !== 6) {
      throw new CustomError("O código do token deve ter 6 caracteres alfanuméricos para o histórico.", 400);
    }
    if (!this._user_info_uuid || !this._user_item_uuid || !this._event_type || !this._event_at) {
      throw new CustomError("Propriedades essenciais do evento de histórico não podem ser nulas.", 400);
    }
  }

  // --- Serialização para o Banco de Dados (ou DTO de saída) ---
  public toJSON(): OfflineTokenHistoryToJSONOutput { // <--- Retorno agora é o novo tipo plano
    return {
      uuid: this._uuid.uuid,
      original_token_uuid: this._original_token_uuid?.uuid ?? null,
      token_code: this._token_code,
      user_info_uuid: this._user_info_uuid.uuid,
      user_item_uuid: this._user_item_uuid.uuid,
      event_type: this._event_type,
      event_description: this._event_description,
      related_transaction_uuid: this._related_transaction_uuid?.uuid ?? null,
      event_at: this._event_at,
      snapshot_expires_at: this._snapshot_expires_at,
      snapshot_status: this._snapshot_status,
    };
  }

  // --- Métodos de Fábrica (Criação e Reconstrução) ---
  public static create(props: Omit<OfflineTokenHistoryProps, 'uuid' | 'event_at'> & { event_at?: Date }): OfflineTokenHistoryEntity {
    const entity = new OfflineTokenHistoryEntity({
      ...props,
      uuid: new Uuid(), // <--- CORRIGIDO: Sempre gera um novo Uuid para o método create
      event_at: props.event_at ?? new Date(),
    });
    // Validação já no construtor
    return entity;
  }

  public static hydrate(props: OfflineTokenHistoryProps): OfflineTokenHistoryEntity {
    // Validação já no construtor
    return new OfflineTokenHistoryEntity(props);
  }
}