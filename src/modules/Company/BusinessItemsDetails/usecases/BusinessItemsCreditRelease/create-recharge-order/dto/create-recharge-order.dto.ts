export type RechargeOrderItemInput = {
    user_item_uuid: string;
    amount: number; // Valor em Reais vindo do Front (ex: 800.00)
}

export type InputCreateRechargeOrderDTO = {
    business_info_uuid: string;
    item_uuid: string; // O benefício (VR, VA, etc.)
    items: RechargeOrderItemInput[]; // A lista final validada pelo RH
}

export type OutputCreateRechargeOrderDTO = {
    order_uuid: string;
    status: string;
    total_amount: number; // Em Reais (para confirmação visual)
    pix_key: string;      // A chave para pagamento
    qr_code_base64?: string; // Opcional: Se já tiver gerador de QR Code
}