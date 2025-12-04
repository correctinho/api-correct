// Não há DTO de entrada, pois os dados vêm do token de autenticação (business_info_uuid)

// DTO de Saída: Uma lista de objetos, onde cada objeto representa uma solicitação pendente.
export interface OutputListProviderPendingRequestsDto {
    requests: PendingRequestItemDto[];
}

// A estrutura de cada item da lista
export interface PendingRequestItemDto {
    request_uuid: string;
    created_at: Date; // Para mostrar "há 2 horas atrás"

    // Dados do Cliente (Simples)
    customer: {
        uuid: string;
        name: string;
        // Opcional: phone: string; (Se o prestador puder ver o contato antes de aceitar)
    };

    // Dados do Serviço
    service: {
        uuid: string;
        name: string;
    };

    // As janelas que o cliente sugeriu
    requested_windows: {
        date: string; // Formato YYYY-MM-DD
        period: 'MORNING' | 'AFTERNOON' | 'EVENING';
    }[];
}