import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../errors/custom.error";
import { newDateF } from "../../../../utils/date";

/**
 * Comando para criar um novo registro de histórico de produto.
 */
export type ProductHistoryCreateCommand = {
    product_uuid: Uuid;
    changed_by_uuid: Uuid;
    field_changed: string;
    old_value?: string | null;
    new_value?: string | null;
};

export type ProductHistoryProps = {
    uuid?: Uuid;
    product_uuid: Uuid;
    changed_by_uuid: Uuid;
    field_changed: string;
    old_value: string | null;
    new_value: string | null;
    changed_at?: Date; // <<< MUDANÇA: Agora é um objeto Date
};

export class ProductHistoryEntity {
    private _uuid: Uuid;
    private _product_uuid: Uuid;
    private _changed_by_uuid: Uuid;
    private _field_changed: string;
    private _old_value: string | null;
    private _new_value: string | null;
    private _changed_at: Date; // <<< MUDANÇA: Agora é um objeto Date

    private constructor(props: ProductHistoryProps) {
        this._uuid = props.uuid ?? new Uuid();
        this._product_uuid = props.product_uuid;
        this._changed_by_uuid = props.changed_by_uuid;
        this._field_changed = props.field_changed;
        this._old_value = props.old_value;
        this._new_value = props.new_value;
        this._changed_at = props.changed_at ?? new Date(); // <<< MUDANÇA: Usa new Date()
        this.validate();
    }

    private validate(): void {
        if (!this._product_uuid) {
            throw new CustomError("Product UUID is required for history record.", 400);
        }
        if (!this._changed_by_uuid) {
            throw new CustomError("User UUID is required for history record.", 400);
        }
        if (!this._field_changed || this._field_changed.trim() === "") {
            throw new CustomError("Field changed is required for history record.", 400);
        }
    }

    // --- Getters ---
    get uuid(): Uuid { return this._uuid; }
    get product_uuid(): Uuid { return this._product_uuid; }
    get changed_by_uuid(): Uuid { return this._changed_by_uuid; }
    get field_changed(): string { return this._field_changed; }
    get old_value(): string | null { return this._old_value; }
    get new_value(): string | null { return this._new_value; }
    get changed_at(): Date { return this._changed_at; }

    // --- Serialização e Fábricas ---

    public toJSON() {
        return {
            uuid: this._uuid.uuid,
            product_uuid: this._product_uuid.uuid,
            changed_by_uuid: this._changed_by_uuid.uuid,
            field_changed: this._field_changed,
            old_value: this._old_value,
            new_value: this._new_value,
            changed_at: this._changed_at,
        };
    }

    public static create(command: ProductHistoryCreateCommand): ProductHistoryEntity {
        const props: ProductHistoryProps = {
            ...command,
            old_value: command.old_value ?? null,
            new_value: command.new_value ?? null,
        };
        return new ProductHistoryEntity(props);
    }

    public static hydrate(props: ProductHistoryProps): ProductHistoryEntity {
        return new ProductHistoryEntity(props);
    }
}
