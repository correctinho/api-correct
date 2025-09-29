import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo';
import { CustomError } from '../../../../errors/custom.error';
import { newDateF } from '../../../../utils/date';

/**
 * Propriedades para reconstruir a entidade a partir do banco de dados.
 * O valor (`value`) já está no formato interno (centavos).
 */
export type BenefitGroupsProps = {
    uuid?: Uuid;
    group_name: string;
    employer_item_details_uuid: Uuid;
    value: number; // Em centavos
    is_default?: boolean;
    business_info_uuid: Uuid;
    created_at?: string;
    updated_at?: string;
};

/**
 * Comando para criar uma NOVA entidade.
 * O valor (`value`) vem da API no formato amigável (Reais).
 */
export type BenefitGroupsCreateCommand = {
    group_name: string;
    employer_item_details_uuid: Uuid;
    value: number; // Em Reais (ex: 500.00)
    is_default?: boolean;
    business_info_uuid: Uuid;
};

export class BenefitGroupsEntity {
    private _uuid: Uuid;
    private _group_name: string;
    private _employer_item_details_uuid: Uuid;
    private _value: number; // Armazenado internamente como centavos
    private _is_default: boolean;
    private _business_info_uuid: Uuid;
    private _created_at: string;
    private _updated_at: string;

    private constructor(props: BenefitGroupsProps) {
        this._uuid = props.uuid ?? new Uuid();
        this._group_name = props.group_name;
        this._employer_item_details_uuid = props.employer_item_details_uuid;
        this._value = props.value;
        this._is_default = props.is_default ?? false;
        this._business_info_uuid = props.business_info_uuid;
        this._created_at = props.created_at ?? newDateF(new Date());
        this._updated_at = props.updated_at ?? newDateF(new Date());

        this.validate();
    }

    // --- GETTERS (Retornam valores em formato amigável) ---
    get uuid(): Uuid {
        return this._uuid;
    }
    get group_name(): string {
        return this._group_name;
    }
    get employer_item_details_uuid(): Uuid {
        return this._employer_item_details_uuid;
    }
    get value(): number {
        return this._value / 100;
    } // Converte de volta para Reais
    get is_default(): boolean {
        return this._is_default;
    }
    get business_info_uuid(): Uuid {
        return this._business_info_uuid;
    }
    get created_at(): string {
        return this._created_at;
    }
    get updated_at(): string {
        return this._updated_at;
    }

    // --- MÉTODOS DE ALTERAÇÃO DE ESTADO ---
    private touch(): void {
        this._updated_at = newDateF(new Date());
    }

    public changeUuid(uuid: Uuid) {
        this._uuid = uuid;
        this.touch();
        this.validate();
    }

    public changeGroupName(group_name: string) {
        this._group_name = group_name;
        this.touch();
        this.validate();
    }

    public changeEmployerItem(employer_item_uuid: Uuid) {
        this._employer_item_details_uuid = employer_item_uuid;
        this.touch();
        this.validate();
    }

    public changeValue(valueInReais: number) {
        this._value = Math.round(valueInReais * 100); // Converte para centavos
        this.touch();
        this.validate();
    }

    public changeIsDefault(is_default: boolean) {
        this._is_default = is_default;
        this.touch();
        this.validate();
    }

    // --- SERIALIZAÇÃO E VALIDAÇÃO ---
    public toJSON() {
        return {
            uuid: this._uuid.uuid,
            group_name: this._group_name,
            employer_item_details_uuid: this._employer_item_details_uuid.uuid,
            value: this._value, // Salva o valor interno (em centavos)
            is_default: this._is_default,
            business_info_uuid: this._business_info_uuid.uuid,
            created_at: this._created_at,
            updated_at: this._updated_at,
        };
    }

    private validate() {
        if (!this._group_name)
            throw new CustomError('Group name is required', 400);
        if (this._value < 0)
            throw new CustomError('Value cannot be negative', 400);
        if (!this._business_info_uuid)
            throw new CustomError('Business Info Uuid is required', 400);
        if (!this._employer_item_details_uuid)
            throw new CustomError('Employer Item Details Uuid is required', 400);
    }

    // --- MÉTODOS DE FÁBRICA ---
    public static create(
        command: BenefitGroupsCreateCommand
    ): BenefitGroupsEntity {
        const props: BenefitGroupsProps = {
            ...command,
            value: Math.round(command.value * 100), // Converte para centavos
        };
        return new BenefitGroupsEntity(props);
    }

    public static hydrate(props: BenefitGroupsProps): BenefitGroupsEntity {
        // Dados do banco já vêm em centavos, então não há conversão.
        return new BenefitGroupsEntity(props);
    }
}
