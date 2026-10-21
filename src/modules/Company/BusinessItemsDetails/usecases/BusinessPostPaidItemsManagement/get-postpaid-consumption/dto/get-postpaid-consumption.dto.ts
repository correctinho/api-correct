export interface InputGetPostpaidConsumptionDTO {
    employer_item_details_uuid: string;
    start_date: string; // Ex: '2026-02-20'
    end_date: string;   // Ex: '2026-03-19'
    business_info_uuid: string; // Opcional, pode ser necessário para validação/autorização dependendo da implementação do UseCase e Repositórios
}

export interface CollaboratorConsumption {
    name: string;
    document: string;
    company_internal_code?: string | null;
    internal_company_code?: string | null;
    total_used: number; // Valor em reais
}

export interface OutputGetPostpaidConsumptionDTO {
    collaborators: CollaboratorConsumption[];
    total_cycle_used: number;
}
