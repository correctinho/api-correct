export interface InputHireUserSubscriptionByCorrectBalanceDTO {
    userId: string; // O ID do usuário logado
    subscriptionPlanUuid: string; // O plano escolhido
    acceptedTermsVersionUuid: string; // O ID da versão dos termos aceita no modal
}

export interface OutputHireUserSubscriptionByCorrectBalanceDTO {
    subscriptionUuid: string;
    status: string; // Sempre 'ACTIVE' em caso de sucesso
    startDate: Date;
    endDate: Date;
    itemName: string; // O nome do serviço contratado para exibir na tela de sucesso
}