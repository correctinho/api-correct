// O que o frontend envia no corpo da requisição
export interface InputCreateServiceRequestDto {
    user_info_uuid: string; 
    product_uuid: string;   // O ID do serviço que está sendo solicitado
    requested_windows: {
        date: string;       // Formato ISO "YYYY-MM-DD"
        period: 'MORNING' | 'AFTERNOON' | 'EVENING';
    }[];
}

// O que devolvemos para o frontend
export interface OutputCreateServiceRequestDto {
    request_uuid: string;
    status: string;
    created_at: Date;
}