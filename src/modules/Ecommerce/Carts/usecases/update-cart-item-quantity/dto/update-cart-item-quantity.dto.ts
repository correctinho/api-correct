/**
 * DTO de entrada para o Usecase de Atualização de Quantidade.
 */
export type InputUpdateCartItemQuantityDTO = {
    /**
     * O UUID do usuário (UserInfo) que está fazendo a requisição (do token).
     */
    userId: string;

    /**
     * O UUID do CartItem a ser atualizado (do parâmetro da URL).
     */
    cartItemId: string;

    /**
     * A nova quantidade total para o item (do corpo da requisição).
     */
    newQuantity: number;
};

/**
 * DTO de saída, representando o estado final e atualizado do carrinho.
 */
export type OutputUpdateCartItemQuantityDTO = {
    cartId: string;
    total: number; // Em Reais
    items: {
        itemId: string;
        productId: string;
        name: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        main_image_url: string | null;
    }[];
};
