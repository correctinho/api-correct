export interface InputSuggestSlotsDto {
    // O ID da request vem pela URL, e o da empresa pelo token.
    // O DTO de entrada foca no payload do body.
    request_uuid: string;
    business_info_uuid: string;
    suggested_slots: {
        // Formato ISO 8601 completo (ex: 2023-12-10T09:30:00.000Z)
        start_datetime: string;
    }[];
}
// Não há DTO de saída específico, um 200 OK vazio é suficiente.