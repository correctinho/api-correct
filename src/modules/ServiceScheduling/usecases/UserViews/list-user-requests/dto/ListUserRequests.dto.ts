export interface UserRequestItemDto {
    request_uuid: string;
    status: string; // 'PENDING_PROVIDER_OPTIONS' | 'PENDING_USER_SELECTION' | ...
    created_at: Date;

    // Dados do Prestador (Quem vai atender)
    provider: {
        uuid: string;
        trade_name: string; // Nome fantasia da clínica/empresa
    };

    // Dados do Serviço
    service: {
        name: string;
    };

    // O que o usuário pediu (para contexto)
    requested_windows: { date: string; period: string }[];

    // O CORAÇÃO DESTA TELA: As opções que o prestador deu
    // Este array só virá preenchido se o status for 'PENDING_USER_SELECTION'
    suggested_slots: {
        slot_uuid: string; // O ID que o usuário vai mandar de volta para confirmar
        start_datetime: string; // ISO 8601 completo
    }[];
}

export interface OutputListUserRequestsDto {
    requests: UserRequestItemDto[];
}