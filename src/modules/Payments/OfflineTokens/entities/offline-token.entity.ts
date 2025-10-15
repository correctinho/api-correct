// src/core/domain/entities/offline-token.entity.ts

import { OfflineTokenStatus } from '@prisma/client';
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../errors/custom.error";

export type OfflineTokenProps = {
  uuid?: Uuid;
  token_code: string;
  user_info_uuid: Uuid;
  user_item_uuid: Uuid;
  status: OfflineTokenStatus;
  expires_at: Date;
  activated_at: Date;
  last_accessed_at?: Date | null;
  last_used_at?: Date | null;
  sequence_number: number;
  created_at?: Date;
  updated_at?: Date;
};

// NOVO TIPO: Interface para o que toJSON() realmente retorna
// Este tipo é o formato "plano" da entidade, com UUIDs como string,
// para ser usado na camada de persistência (Prisma) ou nos DTOs de saída.
export type OfflineTokenToJSONOutput = {
  uuid: string;
  token_code: string;
  user_info_uuid: string;
  user_item_uuid: string;
  status: OfflineTokenStatus;
  expires_at: Date;
  activated_at: Date;
  last_accessed_at: Date | null;
  last_used_at: Date | null;
  sequence_number: number;
  created_at: Date;
  updated_at: Date;
};


export class OfflineTokenEntity {
  private _uuid: Uuid;
  private _token_code: string;
  private _user_info_uuid: Uuid;
  private _user_item_uuid: Uuid;
  private _status: OfflineTokenStatus;
  private _expires_at: Date;
  private _activated_at: Date;
  private _last_accessed_at: Date | null;
  private _last_used_at: Date | null;
  private _sequence_number: number;
  private _created_at: Date;
  private _updated_at: Date;

  private constructor(props: OfflineTokenProps) {
    this._uuid = props.uuid ?? new Uuid();
    this._token_code = props.token_code;
    this._user_info_uuid = props.user_info_uuid;
    this._user_item_uuid = props.user_item_uuid;
    this._status = props.status;
    this._expires_at = props.expires_at;
    this._activated_at = props.activated_at;
    this._last_accessed_at = props.last_accessed_at ?? null;
    this._last_used_at = props.last_used_at ?? null;
    this._sequence_number = props.sequence_number;
    this._created_at = props.created_at ?? new Date();
    this._updated_at = props.updated_at ?? new Date();
    this.validate(); // Valida no construtor
  }

  // --- Getters ---
  get uuid(): Uuid { return this._uuid; }
  get token_code(): string { return this._token_code; }
  get user_info_uuid(): Uuid { return this._user_info_uuid; }
  get user_item_uuid(): Uuid { return this._user_item_uuid; }
  get status(): OfflineTokenStatus { return this._status; }
  get expires_at(): Date { return this._expires_at; }
  get activated_at(): Date { return this._activated_at; }
  get last_accessed_at(): Date | null { return this._last_accessed_at; }
  get last_used_at(): Date | null { return this._last_used_at; }
  get sequence_number(): number { return this._sequence_number; }
  get created_at(): Date { return this._created_at; }
  get updated_at(): Date { return this._updated_at; }

  // --- Métodos de Negócio (Comportamentos) ---
  public markAsConsumed(usedAt: Date = new Date()): void {
    if (this._status !== 'ACTIVE') {
      throw new CustomError(`Token com status '${this._status}' não pode ser marcado como CONSUMED.`, 400);
    }
    if (usedAt > this._expires_at) {
        throw new CustomError("Token expirado não pode ser consumido.", 400);
    }
    this._status = 'CONSUMED';
    this._last_used_at = usedAt;
    this._updated_at = new Date();
    this.validate();
  }

  public touchLastAccessed(): void {
    this._last_accessed_at = new Date();
    this._updated_at = new Date();
  }

  public markAsRevoked(): void {
    if (this._status === 'CONSUMED') {
      throw new CustomError("Token já consumido não pode ser revogado.", 400);
    }
    this._status = 'REVOKED';
    this._updated_at = new Date();
    this.validate();
  }
  
  public markAsExpired(): void {
    if (this._status !== 'ACTIVE') {
        throw new CustomError(`Token com status '${this._status}' não pode ser marcado como EXPIRED.`, 400);
    }
    if (new Date() < this._expires_at) {
        throw new CustomError("Token ainda não expirou.", 400);
    }
    this._status = 'EXPIRED';
    this._updated_at = new Date();
    this.validate();
  }

  // --- Validação Interna ---
  private validate(): void {
    if (!this._token_code || this._token_code.length !== 6) {
      throw new CustomError("O código do token deve ter 6 caracteres alfanuméricos.", 400);
    }
    if (!this._user_info_uuid || !this._user_item_uuid || !this._expires_at || !this._activated_at || this._sequence_number == null) {
      throw new CustomError("Propriedades essenciais do token não podem ser nulas.", 400);
    }
    if (this._sequence_number < 1 || this._sequence_number > 5) {
      throw new CustomError("O número de sequência deve estar entre 1 e 5.", 400);
    }
  }

  // --- Serialização para o Banco de Dados (ou DTO de saída) ---
  // Este método converte a entidade para um objeto plano com UUIDs como string
  public toJSON(): OfflineTokenToJSONOutput { // <--- Retorno agora é o novo tipo plano
    return {
      uuid: this._uuid.uuid,
      token_code: this._token_code,
      user_info_uuid: this._user_info_uuid.uuid,
      user_item_uuid: this._user_item_uuid.uuid,
      status: this._status,
      expires_at: this._expires_at,
      activated_at: this._activated_at,
      last_accessed_at: this._last_accessed_at,
      last_used_at: this._last_used_at,
      sequence_number: this._sequence_number,
      created_at: this._created_at,
      updated_at: this._updated_at,
    };
  }

  // --- Métodos de Fábrica (Criação e Reconstrução) ---
  public static create(props: Omit<OfflineTokenProps, 'uuid' | 'status' | 'activated_at' | 'created_at' | 'updated_at' | 'last_accessed_at' | 'last_used_at'> & {expiresAt?: Date}): OfflineTokenEntity {
    const defaultExpiresAt = props.expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const entity = new OfflineTokenEntity({
      ...props,
      uuid: new Uuid(),
      status: 'ACTIVE',
      activated_at: new Date(),
      expires_at: defaultExpiresAt,
      created_at: new Date(),
      updated_at: new Date(),
      last_accessed_at: null,
      last_used_at: null,
    });
    // A validação já é feita no construtor
    return entity;
  }
  
  public static hydrate(props: OfflineTokenProps): OfflineTokenEntity {
    // A validação já é feita no construtor
    return new OfflineTokenEntity(props);
  }
}