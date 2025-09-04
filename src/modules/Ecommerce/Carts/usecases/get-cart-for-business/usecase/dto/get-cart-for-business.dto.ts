/**
 * DTO de entrada para o Usecase de Busca de Carrinho.
 */
export type InputGetCartForBusinessDTO = {
    /**
     * O UUID do usuário (UserInfo) que está fazendo a requisição (virá do token).
     */
    userInfoId: string;

    /**
     * O UUID do negócio (BusinessInfo) cujo carrinho está sendo buscado (virá do query param).
     */
    businessInfoId: string;
};

/**
 * DTO de saída, representando o estado atual do carrinho.
 */
export type OutputGetCartForBusinessDTO = {
    cartId: string;
    businessInfoId: string;
    total: number; // Em Reais
    items: {
        itemId: string; // UUID do CartItem
        productId: string;
        name: string;
        quantity: number;
        unitPrice: number; // Preço promocional em Reais
        totalPrice: number; // Preço total do item (unitPrice * quantity)
        main_image_url: string | null;
    }[];
} | null; // O use case pode retornar nulo se não houver carrinho.
