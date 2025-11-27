// src/core/domain/entities/subscription-plan.entity.ts

import { BillingPeriod, PayerType } from '@prisma/client';
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../errors/custom.error";

// Tipo para as propriedades internas da entidade (usando Value Objects)
export type SubscriptionPlanProps = {
  uuid?: Uuid;
  item_uuid: Uuid;
  name: string;
  description?: string | null;
  price: number; // ATENÇÃO: Ao hidratar do banco, este valor DEVE ser em CENTAVOS (inteiro).
  currency: string;
  billing_period: BillingPeriod;
  payer_type: PayerType;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
};

// Interface para o retorno do método toJSON() (DTO de saída)
export type SubscriptionPlanToJSONOutput = {
  uuid: string;
  item_uuid: string;
  name: string;
  description: string | null;
  price: number; // SAÍDA: Valor em REAIS (float/decimal), ex: 50.00
  currency: string;
  billing_period: BillingPeriod;
  payer_type: PayerType;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export class SubscriptionPlanEntity {
  private _uuid: Uuid;
  private _item_uuid: Uuid;
  private _name: string;
  private _description: string | null;
  // ARMAZENAMENTO INTERNO: Sempre em centavos (inteiro) para persistência.
  private _price: number;
  private _currency: string;
  private _billing_period: BillingPeriod;
  private _payer_type: PayerType;
  private _is_active: boolean;
  private _created_at: Date;
  private _updated_at: Date;

  // O construtor é privado e usado primariamente pelo hydrate,
  // então ele espera os dados "crus" (preço em centavos).
  private constructor(props: SubscriptionPlanProps) {
    this._uuid = props.uuid ?? new Uuid();
    this._item_uuid = props.item_uuid;
    this._name = props.name;
    this._description = props.description ?? null;
    this._price = props.price; // Recebe centavos diretamente
    this._currency = props.currency;
    this._billing_period = props.billing_period;
    this._payer_type = props.payer_type;
    this._is_active = props.is_active;
    this._created_at = props.created_at ?? new Date();
    this._updated_at = props.updated_at ?? new Date();
    this.validate();
  }

  // --- Getters ---
  get uuid(): Uuid { return this._uuid; }
  get item_uuid(): Uuid { return this._item_uuid; }
  get name(): string { return this._name; }
  get description(): string | null { return this._description; }

  // GETTER MODIFICADO: Retorna em REAIS para a aplicação
  get price(): number {
      return this._price / 100;
  }

  // Getter auxiliar se precisar do valor bruto (para repositórios, por exemplo)
  get rawPriceInCents(): number {
      return this._price;
  }

  get currency(): string { return this._currency; }
  get billing_period(): BillingPeriod { return this._billing_period; }
  get payer_type(): PayerType { return this._payer_type; }
  get is_active(): boolean { return this._is_active; }
  get created_at(): Date { return this._created_at; }
  get updated_at(): Date { return this._updated_at; }

  // --- Métodos de Negócio (Comportamentos) ---

  public activate(): void {
    if (this._is_active) {
        throw new CustomError("O plano já está ativo.", 400);
    }
    this._is_active = true;
    this.touch();
  }

  public deactivate(): void {
    if (!this._is_active) {
        throw new CustomError("O plano já está inativo.", 400);
    }
    this._is_active = false;
    this.touch();
  }

  // MODIFICADO: Assume que o input 'price' vem da aplicação em REAIS.
  public updateDetails(name: string, description: string | null, priceInReais: number): void {
    this._name = name;
    this._description = description;
    // Converte Reais para Centavos antes de armazenar.
    // Math.round é importante para evitar erros de ponto flutuante (ex: 49.9999999 -> 5000)
    this._price = Math.round(priceInReais * 100);
    this.touch();
    this.validate();
  }

  private touch(): void {
    this._updated_at = new Date();
  }


  // --- Validação Interna ---
  private validate(): void {
    if (!this._item_uuid) {
        throw new CustomError("O UUID do Item é obrigatório.", 400);
    }
    if (!this._name || this._name.trim().length < 3) {
        throw new CustomError("O nome do plano deve ter pelo menos 3 caracteres.", 400);
    }
    // Valida se o valor interno está salvo corretamente como inteiro (centavos)
    if (this._price < 0 || !Number.isInteger(this._price)) {
        throw new CustomError("O preço interno deve ser um número inteiro positivo (centavos).", 400);
    }
    if (!this._currency || this._currency.length !== 3) {
        throw new CustomError("A moeda deve ter 3 caracteres (ex: BRL).", 400);
    }
  }


  // --- Serialização para DTO de saída ---
  public toJSON(): SubscriptionPlanToJSONOutput {
    return {
      uuid: this._uuid.uuid,
      item_uuid: this._item_uuid.uuid,
      name: this._name,
      description: this._description,
      price: this.price, // Usa o getter para retornar em REAIS
      currency: this._currency,
      billing_period: this._billing_period,
      payer_type: this._payer_type,
      is_active: this._is_active,
      created_at: this._created_at,
      updated_at: this._updated_at,
    };
  }

  // --- Métodos de Fábrica ---

  // MODIFICADO: O método create é usado pela aplicação para novos planos.
  // Assume que props.price está em REAIS e converte para centavos.
  public static create(props: Omit<SubscriptionPlanProps, 'uuid' | 'created_at' | 'updated_at' | 'is_active' | 'currency' | 'price'> & { currency?: string, is_active?: boolean, price: number }): SubscriptionPlanEntity {
    // Converte o input em Reais para Centavos
    const priceInCents = Math.round(props.price * 100);

    return new SubscriptionPlanEntity({
      ...props,
      price: priceInCents, // Passa centavos para o construtor
      uuid: new Uuid(),
      currency: props.currency ?? 'BRL',
      is_active: props.is_active ?? true,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  // Hidratação: Assume que os dados vêm do Repositório/DB, portanto o preço JÁ ESTÁ em centavos.
  public static hydrate(props: SubscriptionPlanProps): SubscriptionPlanEntity {
    if (!props.uuid) {
        throw new CustomError("UUID é obrigatório para hidratar um SubscriptionPlan.", 500);
    }
    // Não faz conversão de preço aqui, pois o banco já entrega em centavos.
    return new SubscriptionPlanEntity(props);
  }
}