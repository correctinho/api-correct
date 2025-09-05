// A saída é um DTO que representa o estado final do carrinho para a API.
export interface OutputDeleteCartItemDTO {
    cartId: string;
    total: number;
    items: {
        itemId: string;
        productId: string;
        name: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        main_image_url: string | null;
    }[];
}

// A entrada contém as informações necessárias para executar o caso de uso.
export interface InputDeleteCartItemDTO {
    cartItemId: string; // UUID do item a ser deletado
    userId: string;     // UUID do usuário logado (para segurança)
}