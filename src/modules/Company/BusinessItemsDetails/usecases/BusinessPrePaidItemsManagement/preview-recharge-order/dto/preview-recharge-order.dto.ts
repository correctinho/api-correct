export type InputPreviewRechargeOrderDTO = {
    business_info_uuid: string;
    item_uuid: string; // O ID do benefício 
}

export type RechargeOrderItemPreviewDTO = {
    user_item_uuid: string;
    user_name: string;
    user_document: string; // CPF do funcionário
    group_name: string | null;
    
    // O sistema sugere este valor baseado no Grupo
    suggested_amount: number; 
}

export type OutputPreviewRechargeOrderDTO = {
    total_suggested: number; // Soma total automática
    total_count: number;     // Quantos funcionários
    items: RechargeOrderItemPreviewDTO[];
}