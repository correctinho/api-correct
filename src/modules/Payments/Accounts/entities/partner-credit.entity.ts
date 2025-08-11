// Localização Sugerida: /modules/company/entities/partner-credit.entity.ts

import { PartnerCreditStatus } from "@prisma/client";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../errors/custom.error";

// Propriedades para criar ou reconstruir a entidade.
// Todos os valores monetários são em centavos.
export type PartnerCreditProps = {
    uuid?: Uuid;
    business_account_uuid: Uuid;
    original_transaction_uuid: Uuid;
    balance: number;
    spent_amount: number;
    status: PartnerCreditStatus;
    availability_date: Date;
    created_at?: Date;
    updated_at?: Date;
};

export class PartnerCreditEntity {
    private _uuid: Uuid;
    private _business_account_uuid: Uuid;
    private _original_transaction_uuid: Uuid;
    private _balance: number; // Saldo restante do crédito, em centavos
    private _spent_amount: number; // Valor já gasto deste crédito, em centavos
    private _status: PartnerCreditStatus;
    private _availability_date: Date; // Data em que o saldo restante será liquidado
    private _created_at: Date;
    private _updated_at: Date;

    private constructor(props: PartnerCreditProps) {
        this._uuid = props.uuid ?? new Uuid();
        this._business_account_uuid = props.business_account_uuid;
        this._original_transaction_uuid = props.original_transaction_uuid;
        this._balance = props.balance;
        this._spent_amount = props.spent_amount;
        this._status = props.status;
        this._availability_date = props.availability_date;
        this._created_at = props.created_at ?? new Date();
        this._updated_at = new Date();
    }

    // --- Getters ---
    // Retornam os dados em formatos convenientes para o resto da aplicação

    get uuid(): Uuid { return this._uuid; }
    get business_account_uuid(): Uuid { return this._business_account_uuid; }
    get original_transaction_uuid(): Uuid { return this._original_transaction_uuid; }
    get status(): PartnerCreditStatus { return this._status; }
    get availability_date(): Date { return this._availability_date; }
    get created_at(): Date { return this._created_at; }
    get updated_at(): Date { return this._updated_at; }
    
    // Getters monetários retornam o valor em Reais
    get balance(): number { return this._balance / 100; }
    get spent_amount(): number { return this._spent_amount / 100; }

    // --- Métodos de Negócio (Comportamentos) ---

    /**
     * Deduz um valor do saldo deste crédito.
     * @param amountToSpendInCents O valor a ser gasto, em centavos.
     */
    public spend(amountToSpendInCents: number): void {
        if (this._status !== 'PENDING') {
            throw new CustomError("Apenas créditos pendentes podem ser gastos.", 400);
        }
        if (amountToSpendInCents <= 0) {
            throw new CustomError("O valor a ser gasto deve ser positivo.", 400);
        }
        if (amountToSpendInCents > this._balance) {
            throw new CustomError("Valor do gasto excede o saldo do crédito.", 400);
        }

        this._balance -= amountToSpendInCents;
        this._spent_amount += amountToSpendInCents;
        this._updated_at = new Date();
        this.validate();
    }

    /**
     * Marca o crédito como liquidado.
     */
    public settle(): void {
        if (this._status !== 'PENDING') {
            throw new CustomError("Apenas créditos pendentes podem ser liquidados.", 400);
        }
        this._status = 'SETTLED';
        this._updated_at = new Date();
        this.validate();
    }

    // --- Validação Interna ---
    private validate(): void {
        if (this._balance < 0) {
            throw new CustomError("O saldo do crédito não pode ser negativo.", 500);
        }
        if (this._spent_amount < 0) {
            throw new CustomError("O valor gasto não pode ser negativo.", 500);
        }
    }

    // --- Serialização para o Banco de Dados ---
    public toJSON(): Omit<PartnerCreditProps, 'uuid' | 'business_account_uuid' | 'original_transaction_uuid'> & { uuid: string, business_account_uuid: string, original_transaction_uuid: string } {
        return {
            uuid: this._uuid.uuid,
            business_account_uuid: this._business_account_uuid.uuid,
            original_transaction_uuid: this._original_transaction_uuid.uuid,
            balance: this._balance, // Em centavos
            spent_amount: this._spent_amount, // Em centavos
            status: this._status,
            availability_date: this._availability_date,
            created_at: this._created_at,
            updated_at: this._updated_at,
        };
    }

    // --- Métodos de Fábrica (Criação e Reconstrução) ---

    /**
     * Cria uma nova instância de um crédito de parceiro.
     */
    public static create(props: Omit<PartnerCreditProps, 'uuid' | 'spent_amount' | 'status'>): PartnerCreditEntity {
        const entity = new PartnerCreditEntity({
            ...props,
            spent_amount: 0,
            status: 'PENDING',
        });
        entity.validate();
        return entity;
    }
    
    /**
     * Reconstrói uma entidade a partir dos dados do banco de dados.
     */
    public static hydrate(props: PartnerCreditProps): PartnerCreditEntity {
        return new PartnerCreditEntity(props);
    }
}