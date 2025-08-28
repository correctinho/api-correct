import { ProductType } from "@prisma/client";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../errors/custom.error";
import { ProductEntity } from "../../Products/entities/product.entity";

export type CartItemProps = {
    uuid?: Uuid;
    product: ProductEntity; // A entidade do produto completa
    quantity: number;
};

export class CartItemEntity {
    private _uuid: Uuid;
    private _product: ProductEntity;
    private _quantity: number;

    private constructor(props: CartItemProps) {
        this._uuid = props.uuid ?? new Uuid();
        this._product = props.product;
        this._quantity = props.quantity;
        this.validate();
    }

    private validate(): void {
        if (this._quantity <= 0) {
            throw new CustomError("A quantidade do item deve ser pelo menos 1.", 400);
        }

        // A verificação de estoque agora só acontece para produtos do tipo FÍSICO.
        // Serviços não terão seu estoque validado.
        if (this._product.product_type === ProductType.PHYSICAL) {
            if (this._quantity > this._product.stock) {
                throw new CustomError(`Estoque insuficiente para o produto "${this._product.name}". Disponível: ${this._product.stock}`, 400);
            }
        }
    }

    // --- Getters ---
    get uuid(): Uuid { return this._uuid; }
    get product(): ProductEntity { return this._product; }
    get quantity(): number { return this._quantity; }
    get total(): number { return this._product.promotional_price * this._quantity; } // Total em Reais

    // --- Métodos de Negócio ---
    public increaseQuantity(amount: number): void {
        this._quantity += amount;
        this.validate();
    }

    public decreaseQuantity(amount: number): void {
        this._quantity -= amount;
        this.validate();
    }

    public changeQuantity(newQuantity: number): void {
        this._quantity = newQuantity;
        this.validate();
    }

    // --- Fábrica ---
    public static create(props: CartItemProps): CartItemEntity {
        return new CartItemEntity(props);
    }
}