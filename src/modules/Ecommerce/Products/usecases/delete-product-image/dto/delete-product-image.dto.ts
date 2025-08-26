export type InputDeleteProductImagesDTO = {
    /**
     * O UUID do produto a ser atualizado (do parâmetro da URL).
     */
    productId: string;

    /**
     * O UUID do usuário de negócio que está fazendo a requisição (do token).
     */
    businessUserId: string;

    /**
     * Um array contendo as URLs públicas completas das imagens a serem deletadas.
     */
    urlsToDelete: string[];
};

/**
 * DTO de saída, retornando o estado final do produto.
 */
export type OutputDeleteProductImagesDTO = {
    productId: string;
    message: string;
    remainingImages: string[]; // A lista de URLs de imagem que sobraram no produto.
};
