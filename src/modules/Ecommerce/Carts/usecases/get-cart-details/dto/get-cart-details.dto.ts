// Em: src/modules/Ecommerce/Carts/usecases/get-cart-details/dto/get-cart-details.dto.ts

export interface InputGetCartDetailsDTO {
    cartId: string;
    userId: string; // Essencial para a verificação de segurança
}

// O DTO de saída detalhado que planejamos anteriormente
export interface OutputGetCartDetailsDTO {
    cartId: string;
    businessInfo: {
        id: string;
        name: string;
    };
    priceSummary: {
        subtotal: number;
        total: number;
    };
    items: {
        itemId: string;
        productId: string;
        name: string;
        brand: string;
        imageUrl: string | null;
        quantity: number;
        stock: number;
        isActive: boolean;
        unitPrice: {
            original: number;
            promotional: number;
        };
        totalPrice: number;
    }[];
    checkoutReady: boolean;
}