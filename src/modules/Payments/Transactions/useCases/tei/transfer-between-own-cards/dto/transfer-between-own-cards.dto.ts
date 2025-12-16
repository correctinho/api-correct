export interface InputTransferBetweenOwnCardsDTO {
    userId: string; // O ID do usuário logado (vem do token no controller)
    originUserItemUuid: string; // O ID do UserItem de onde o dinheiro sai
    destinationUserItemUuid: string; // O ID do UserItem para onde o dinheiro vai
    amountInCents: number; // O valor em centavos
}