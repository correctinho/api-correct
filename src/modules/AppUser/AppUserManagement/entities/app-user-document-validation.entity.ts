import { UserDocumentValidationStatus } from "@prisma/client";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../errors/custom.error";
import { newDateF } from "../../../../utils/date";

// Tipo de propriedades para o construtor da entidade (para criação ou carregamento)
export type DocumentValidationProps = {
    uuid?: Uuid;
    document_front_url?: string | null;
    document_front_status?: UserDocumentValidationStatus;
    document_back_url?: string | null;
    document_back_status?: UserDocumentValidationStatus;
    selfie_url?: string | null;
    selfie_status?: UserDocumentValidationStatus;
    document_selfie_url?: string | null;
    document_selfie_status?: UserDocumentValidationStatus;
    created_at?: string;
    updated_at?: string;
};

// Tipo de dados brutos que vêm do banco de dados (ex: Prisma)
// O Uuid aqui é string, pois é como vem do banco.
export type DocumentValidationPrimitiveProps = {
    uuid: string;
    document_front_url: string | null;
    document_front_status: UserDocumentValidationStatus;
    document_back_url: string | null;
    document_back_status: UserDocumentValidationStatus;
    selfie_url: string | null;
    selfie_status: UserDocumentValidationStatus;
    document_selfie_url: string | null;
    document_selfie_status: UserDocumentValidationStatus;
    created_at: string;
    updated_at: string;
};


export class DocumentValidationEntity {
    private _uuid: Uuid;
    private _document_front_url: string | null;
    private _document_front_status: UserDocumentValidationStatus;
    private _document_back_url: string | null;
    private _document_back_status: UserDocumentValidationStatus;
    private _selfie_url: string | null;
    private _selfie_status: UserDocumentValidationStatus;
    private _document_selfie_url: string | null;
    private _document_selfie_status: UserDocumentValidationStatus;
    private _created_at: string; // Garantindo que seja string, não undefined
    private _updated_at: string; // Garantindo que seja string, não undefined

    constructor(props: DocumentValidationProps) {
        this._uuid = props.uuid ?? new Uuid();
        this._document_front_url = props.document_front_url ?? null;
        this._document_front_status = props.document_front_status ?? UserDocumentValidationStatus.pending_to_send;
        this._document_back_url = props.document_back_url ?? null;
        this._document_back_status = props.document_back_status ?? UserDocumentValidationStatus.pending_to_send;
        this._selfie_url = props.selfie_url ?? null;
        this._selfie_status = props.selfie_status ?? UserDocumentValidationStatus.pending_to_send;
        this._document_selfie_url = props.document_selfie_url ?? null;
        this._document_selfie_status = props.document_selfie_status ?? UserDocumentValidationStatus.pending_to_send;

        this._created_at = props.created_at ?? newDateF(new Date());
        this._updated_at = props.updated_at ?? newDateF(new Date());

        this.validate(); 
    }

    get uuid(): Uuid {
        return this._uuid;
    }

    get document_front_url(): string | null { return this._document_front_url; }
    get document_front_status(): UserDocumentValidationStatus { return this._document_front_status; }

    get document_back_url(): string | null { return this._document_back_url; }
    get document_back_status(): UserDocumentValidationStatus { return this._document_back_status; }

    get selfie_url(): string | null { return this._selfie_url; }
    get selfie_status(): UserDocumentValidationStatus { return this._selfie_status; }

    get document_selfie_url(): string | null { return this._document_selfie_url; }
    get document_selfie_status(): UserDocumentValidationStatus { return this._document_selfie_status; }

    get created_at(): string { return this._created_at; }
    get updated_at(): string { return this._updated_at; }

    changeDocumentFrontUrl(url: string | null) {
        this._document_front_url = url;
        this._updated_at = newDateF(new Date());
        this.validate();
    }
    changeDocumentFrontStatus(status: UserDocumentValidationStatus) {
        this._document_front_status = status;
        this._updated_at = newDateF(new Date());
        this.validate();
    }

    changeDocumentBackUrl(url: string | null) {
        this._document_back_url = url;
        this._updated_at = newDateF(new Date());
        this.validate();
    }
    changeDocumentBackStatus(status: UserDocumentValidationStatus) {
        this._document_back_status = status;
        this._updated_at = newDateF(new Date());
        this.validate();
    }

    changeSelfieUrl(url: string | null) {
        this._selfie_url = url;
        this._updated_at = newDateF(new Date());
        this.validate();
    }
    changeSelfieStatus(status: UserDocumentValidationStatus) {
        this._selfie_status = status;
        this._updated_at = newDateF(new Date());
        this.validate();
    }

    changeDocumentSelfieUrl(url: string | null) {
        this._document_selfie_url = url;
        this._updated_at = newDateF(new Date());
        this.validate();
    }
    changeDocumentSelfieStatus(status: UserDocumentValidationStatus) {
        this._document_selfie_status = status;
        this._updated_at = newDateF(new Date());
        this.validate();
    }

    validate() {
        if (this._document_front_url !== null && typeof this._document_front_url !== 'string') {
            throw new CustomError("Document front URL must be a string or null.", 400);
        }
        if (this._document_front_url !== null && this._document_front_url.trim() === '') {
            throw new CustomError("Document front URL cannot be an empty string if provided.", 400);
        }
        // Repetir para os outros campos de URL
        if (this._document_back_url !== null && typeof this._document_back_url !== 'string') {
            throw new CustomError("Document back URL must be a string or null.", 400);
        }
        if (this._document_back_url !== null && this._document_back_url.trim() === '') {
            throw new CustomError("Document back URL cannot be an empty string if provided.", 400);
        }
        if (this._selfie_url !== null && typeof this._selfie_url !== 'string') {
            throw new CustomError("Selfie URL must be a string or null.", 400);
        }
        if (this._selfie_url !== null && this._selfie_url.trim() === '') {
            throw new CustomError("Selfie URL cannot be an empty string if provided.", 400);
        }
        if (this._document_selfie_url !== null && typeof this._document_selfie_url !== 'string') {
            throw new CustomError("Document selfie URL must be a string or null.", 400);
        }
        if (this._document_selfie_url !== null && this._document_selfie_url.trim() === '') {
            throw new CustomError("Document selfie URL cannot be an empty string if provided.", 400);
        }

        // Validação de status (ex: garantir que é um valor do enum)
        const validStatuses = Object.values(UserDocumentValidationStatus);
        if (!validStatuses.includes(this._document_front_status)) {
            throw new CustomError(`Invalid status for document_front_status: ${this._document_front_status}`, 400);
        }
        if (!validStatuses.includes(this._document_back_status)) {
            throw new CustomError(`Invalid status for document_back_status: ${this._document_back_status}`, 400);
        }
        if (!validStatuses.includes(this._selfie_status)) {
            throw new CustomError(`Invalid status for selfie_status: ${this._selfie_status}`, 400);
        }
        if (!validStatuses.includes(this._document_selfie_status)) {
            throw new CustomError(`Invalid status for document_selfie_status: ${this._document_selfie_status}`, 400);
        }
    }

    // Método estático para criar uma nova entidade
    static create(data: DocumentValidationProps): DocumentValidationEntity {
        const documents = new DocumentValidationEntity(data);
        return documents;
    }

    // Método estático para hidratar uma entidade a partir de dados brutos (do banco)
    static hydrate(data: DocumentValidationPrimitiveProps): DocumentValidationEntity {
        const props: DocumentValidationProps = {
            uuid: new Uuid(data.uuid), // Converte a string UUID para o Value Object
            document_front_url: data.document_front_url,
            document_front_status: data.document_front_status,
            document_back_url: data.document_back_url,
            document_back_status: data.document_back_status,
            selfie_url: data.selfie_url,
            selfie_status: data.selfie_status,
            document_selfie_url: data.document_selfie_url,
            document_selfie_status: data.document_selfie_status,
            created_at: data.created_at,
            updated_at: data.updated_at,
        };
        // Chama o construtor da entidade. A validação será executada aqui.
        return new DocumentValidationEntity(props);
    }

    // Método para serializar a entidade para um objeto JSON (útil para APIs)
    toJSON(): DocumentValidationPrimitiveProps {
        return {
            uuid: this._uuid.uuid,
            document_front_url: this._document_front_url,
            document_front_status: this._document_front_status,
            document_back_url: this._document_back_url,
            document_back_status: this._document_back_status,
            selfie_url: this._selfie_url,
            selfie_status: this._selfie_status,
            document_selfie_url: this._document_selfie_url,
            document_selfie_status: this._document_selfie_status,
            created_at: this._created_at,
            updated_at: this._updated_at,
        };
    }
}