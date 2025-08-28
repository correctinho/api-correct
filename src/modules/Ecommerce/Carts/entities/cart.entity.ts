import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../errors/custom.error";
import { ProductEntity } from "../../Products/entities/product.entity";
import { CartItemEntity } from "./cart-item.entity";
import { newDateF } from "../../../../utils/date";

export type CartProps = {
    uuid?: Uuid;
    user_info_uuid: Uuid;
    business_info_uuid: Uuid;
    items?: CartItemEntity[];
    created_at?: string;
    updated_at?: string;
};

/**
 * Entidade que representa o Carrinho de Compras.
 * Atua como um "agregado", gerenciando a coleção de CartItemEntity.
 */
export class CartEntity {
    private _uuid: Uuid;
    private _user_info_uuid: Uuid;
    private _business_info_uuid: Uuid;
    private _items: CartItemEntity[];
    private _created_at: string;
    private _updated_at: string;

    private constructor(props: CartProps) {
        this._uuid = props.uuid ?? new Uuid();
        this._user_info_uuid = props.user_info_uuid;
        this._business_info_uuid = props.business_info_uuid;
        this._items = props.items ?? [];
        this._created_at = props.created_at ?? newDateF(new Date());
        this._updated_at = props.updated_at ?? newDateF(new Date());
    }

    // --- Getters ---
    get uuid(): Uuid { return this._uuid; }
    get user_info_uuid(): Uuid { return this._user_info_uuid; }
    get business_info_uuid(): Uuid { return this._business_info_uuid; }
    get items(): CartItemEntity[] { return this._items; }
    get total(): number {
        const totalInReais = this._items.reduce((sum, item) => sum + item.total, 0);
        // Arredonda para 2 casas decimais para evitar imprecisões de float
        return Math.round(totalInReais * 100) / 100;
    }

    // --- Métodos de Negócio ---

    public addItem(product: ProductEntity, quantity: number = 1): void {
        if (product.business_info_uuid.uuid !== this._business_info_uuid.uuid) {
            throw new CustomError("Este produto não pertence à loja deste carrinho.", 400);
        }

        const existingItem = this._items.find(item => item.product.uuid.uuid === product.uuid.uuid);

        if (existingItem) {
            // Se o item já existe, apenas aumenta a quantidade
            existingItem.increaseQuantity(quantity);
        } else {
            // Se não existe, cria um novo CartItem
            const newItem = CartItemEntity.create({ product, quantity });
            this._items.push(newItem);
        }
        this.touch();
    }

    public removeItem(productId: Uuid): void {
        this._items = this._items.filter(item => item.product.uuid.uuid !== productId.uuid);
        this.touch();
    }

    public updateItemQuantity(productId: Uuid, newQuantity: number): void {
        const itemToUpdate = this._items.find(item => item.product.uuid.uuid === productId.uuid);
        if (!itemToUpdate) {
            throw new CustomError("Item não encontrado no carrinho.", 404);
        }
        if (newQuantity <= 0) {
            // Se a nova quantidade for zero ou menos, remove o item
            this.removeItem(productId);
        } else {
            itemToUpdate.changeQuantity(newQuantity);
        }
        this.touch();
    }
    
    public clear(): void {
        this._items = [];
        this.touch();
    }
    
    private touch(): void {
        this._updated_at = newDateF(new Date());
    }

    // --- Serialização e Fábricas ---

    public toJSON() {
        return {
            uuid: this._uuid.uuid,
            user_info_uuid: this._user_info_uuid.uuid,
            business_info_uuid: this._business_info_uuid.uuid,
            total_in_cents: Math.round(this.total * 100),
            created_at: this._created_at,
            updated_at: this._updated_at,
            items: this.items.map(item => ({
                item_uuid: item.uuid.uuid,
                product_uuid: item.product.uuid.uuid,
                quantity: item.quantity,
            }))
        };
    }

    public static create(props: Omit<CartProps, 'items'>): CartEntity {
        return new CartEntity(props);
    }

    public static hydrate(props: CartProps): CartEntity {
        return new CartEntity(props);
    }
}
