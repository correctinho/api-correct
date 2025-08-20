import { randomUUID } from 'crypto';
import { newDateF } from '../../../../utils/date';
import { CustomError } from '../../../../errors/custom.error';
import { BusinessAccountStatus } from '@prisma/client';
import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo';

export type BusinessAccountProps = {
  uuid?: Uuid;
  balance: number; // Sempre em centavos
  business_info_uuid: Uuid;
  status: BusinessAccountStatus;
  created_at?: string;
  updated_at?: string | null; // Corrigido para aceitar nulo
};

// Comando para criar uma nova conta, aceita o saldo inicial em Reais
export type BusinessAccountCreateCommand = {
  balanceInReais: number; // Explicito que o valor de entrada é em Reais
  business_info_uuid: Uuid;
  status?: BusinessAccountStatus;
};

export class BusinessAccountEntity {
  private _uuid: Uuid;
  private _balance: number; // Armazenado internamente em centavos
  private _business_info_uuid: Uuid;
  private _status: BusinessAccountStatus;
  private _created_at: string;
  private _updated_at: string | null;

  private constructor(props: BusinessAccountProps) {
    // Construtor agora é privado e só atribui valores, esperando centavos.
    this._uuid = props.uuid ?? new Uuid();
    this._business_info_uuid = props.business_info_uuid;
    this._balance = props.balance;
    this._status = props.status ?? 'active';
    this._created_at = props.created_at ?? newDateF(new Date());
    this._updated_at = props.updated_at ?? newDateF(new Date());
    this.validate();
  }

  // --- Getters ---
  get uuid(): Uuid { return this._uuid; }
  // Getter de balance retorna em Reais, como deve ser para a camada de apresentação.
  get balance(): number { return this._balance / 100; }
  get business_info_uuid(): Uuid { return this._business_info_uuid; }
  get status(): BusinessAccountStatus { return this._status; }
  get created_at(): string { return this._created_at }
  get updated_at(): string { return this._updated_at }

  // --- Métodos de Negócio (Comportamentos) ---
  public credit(amountInCents: number): void {
    if (amountInCents < 0) throw new CustomError('O valor a ser creditado não pode ser negativo.', 400);
    this._balance += amountInCents;
    this.validate();
  }

  public debit(amountInCents: number): void {
    if (amountInCents < 0) throw new CustomError('O valor a ser debitado não pode ser negativo.', 400);
    if (this._balance < amountInCents) throw new CustomError('Saldo insuficiente.', 400);
    this._balance -= amountInCents;
    this.validate();
  }

  // ... outros métodos como inactivate/activate ...

  private validate(): void {
    if (!this._business_info_uuid) {
      throw new CustomError('Business info UUID is required', 400);
    }
    if (this._balance < 0) {
      throw new CustomError('Balance cannot be negative', 400);
    }
  }

  // --- Serialização e Fábricas ---
  public toJSON() {
    return {
      uuid: this._uuid.uuid,
      balance: this._balance, // Retorna o valor interno em CENTAVOS
      business_info_uuid: this._business_info_uuid.uuid,
      status: this._status,
      created_at: this._created_at,
      updated_at: this._updated_at,
    };
  }

  public static hydrate(props: BusinessAccountProps): BusinessAccountEntity {
    return new BusinessAccountEntity(props);
  }


  public static create(command: BusinessAccountCreateCommand): BusinessAccountEntity {
    const props: BusinessAccountProps = {
      ...command,
      // Se o status não for informado, a conta será 'active' por padrão.
      status: command.status ?? BusinessAccountStatus.active,
      balance: Math.round(command.balanceInReais * 100),
    };
    const businessAccount = new BusinessAccountEntity(props);
    return businessAccount;
  }
}