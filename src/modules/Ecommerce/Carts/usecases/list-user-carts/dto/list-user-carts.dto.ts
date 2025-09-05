// A entrada para o caso de uso é simples: apenas o ID do usuário.
export interface InputListUserCartsDTO {
    userId: string;
}

// A saída é uma lista (array) de carrinhos, formatada de forma resumida.
// Esta estrutura corresponde exatamente ao que definimos no nosso teste E2E.
export interface OutputListUserCartsDTO extends Array<{
    cartId: string;
    businessInfo: {
        id: string;
        name: string;
    };
    itemCount: number;
    priceSummary: {
        total: number;
    };
    itemThumbnails: (string | null)[];
}> {}