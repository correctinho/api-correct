// ARQUIVO 1: add-item-to-cart.dto.ts
export type InputAddItemToCartDTO = {
    userId: string;
    businessId: string;
    productId: string;
    quantity: number;
};

export type OutputAddItemToCartDTO = {
    cartId: string;
    total: number;
    items: {
        productId: string;
        name: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];
};