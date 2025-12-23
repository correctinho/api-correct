import { Uuid } from "../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../errors/custom.error";
import { TermsTypeEnum } from "./enums/terms-type.enum";

// Tipagem das propriedades da entidade
export type TermsOfServiceProps = {
    version: string;
    content: string;
    type: TermsTypeEnum;   // Usa o Enum de domínio
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
};

export class TermsOfServiceEntity {
    // Gerenciamento interno de estado
    private _uuid: Uuid;
    private _props: TermsOfServiceProps;

    // Construtor privado. Se não passar UUID, gera um novo.
    private constructor(props: TermsOfServiceProps, uuid?: Uuid) {
        this._props = props;
        this._uuid = uuid || new Uuid();
    }

    // Getters
    get uuid(): Uuid { return this._uuid; }
    get version(): string { return this._props.version; }
    get content(): string { return this._props.content; }
    get type(): TermsTypeEnum { return this._props.type; }
    get is_active(): boolean { return this._props.is_active; }
    get created_at(): Date | undefined { return this._props.created_at; }
    get updated_at(): Date | undefined { return this._props.updated_at; }

    /**
     * Método fábrica para criar uma NOVA versão de termos.
     * Gera um novo UUID automaticamente no construtor.
     */
    static create(props: { version: string; content: string; type: TermsTypeEnum }): TermsOfServiceEntity {
        if (!props.version || props.version.length < 2) throw new CustomError("Versão do termo inválida.", 400);
        if (!props.content || props.content.length < 20) throw new CustomError("Conteúdo do termo muito curto.", 400);

        return new TermsOfServiceEntity({
            ...props,
            is_active: true, // Ao criar, geralmente já nasce ativo
            created_at: new Date(),
            updated_at: new Date()
        });
    }

    /**
     * Método para reconstruir a entidade vinda do banco de dados.
     * Exige que o UUID já existente seja passado.
     */
    static hydrate(props: TermsOfServiceProps, uuid: Uuid): TermsOfServiceEntity {
        return new TermsOfServiceEntity(props, uuid);
    }

    // Métodos de comportamento (alteram o estado interno)
    activate(): void {
        this._props.is_active = true;
        this._props.updated_at = new Date();
    }

    deactivate(): void {
        this._props.is_active = false;
        this._props.updated_at = new Date();
    }

    // Método auxiliar para exportar os dados (útil para mappers)
    toJSON(): TermsOfServiceProps & { uuid: string } {
        return {
            uuid: this._uuid.uuid,
            ...this._props
        }
    }
}