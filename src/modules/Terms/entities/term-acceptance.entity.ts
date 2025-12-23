import { Uuid } from "../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../errors/custom.error";

export type TermAcceptanceProps = {
    // Polimórfico: um dos dois deve estar presente
    app_user_info_uuid: Uuid | null;
    company_user_uuid: Uuid | null;

    // Qual versão aceitou?
    terms_uuid: Uuid;

    // Vínculo opcional com transação
    transaction_uuid: Uuid | null;

    accepted_at: Date;
    ip_address?: string | null;
    user_agent?: string | null;
};

export class TermAcceptanceEntity {
    private _uuid: Uuid;
    private _props: TermAcceptanceProps;

    private constructor(props: TermAcceptanceProps, uuid?: Uuid) {
        this._props = props;
        this._uuid = uuid || new Uuid();
        this.validatePolymorphism();
    }

    private validatePolymorphism(): void {
        const hasAppUser = !!this._props.app_user_info_uuid;
        const hasCompanyUser = !!this._props.company_user_uuid;

        if (hasAppUser && hasCompanyUser) {
            throw new CustomError("Registo de aceite inválido: não pode pertencer a usuário e empresa simultaneamente.", 500);
        }
        if (!hasAppUser && !hasCompanyUser) {
            throw new CustomError("Registo de aceite inválido: deve pertencer a um usuário ou empresa.", 500);
        }
    }

    // Getters
    get uuid(): Uuid { return this._uuid; }
    get app_user_info_uuid(): Uuid | null { return this._props.app_user_info_uuid; }
    get company_user_uuid(): Uuid | null { return this._props.company_user_uuid; }
    get terms_uuid(): Uuid { return this._props.terms_uuid; }
    get transaction_uuid(): Uuid | null { return this._props.transaction_uuid; }
    get accepted_at(): Date { return this._props.accepted_at; }
    get ip_address(): string | null | undefined { return this._props.ip_address; }
    get user_agent(): string | null | undefined { return this._props.user_agent; }
    /**
     * Fábrica para aceite por USUÁRIO DO APP (B2C).
     */
    static createForAppUser(props: {
        userUuid: Uuid,
        termsUuid: Uuid,
        transactionUuid?: Uuid | null,
        ipAddress?: string | null,
        userAgent?: string | null,
    }): TermAcceptanceEntity {
        return new TermAcceptanceEntity({
            app_user_info_uuid: props.userUuid,
            company_user_uuid: null,
            terms_uuid: props.termsUuid,
            transaction_uuid: props.transactionUuid || null,
            accepted_at: new Date(),
            ip_address: props.ipAddress || null,
            user_agent: props.userAgent || null,
        });
    }

    // (Futuro) static createForCompany(...)

    /**
     * Hidratação via banco de dados.
     */
    static hydrate(props: TermAcceptanceProps, uuid: Uuid): TermAcceptanceEntity {
        return new TermAcceptanceEntity(props, uuid);
    }

    toJSON(): TermAcceptanceProps & { uuid: string } {
        return {
            uuid: this._uuid.uuid,
            ...this._props
        }
    }
}