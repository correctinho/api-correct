// DTO de Entrada
export type InputActivateBatchDTO = {
    business_info_uuid: string;
    item_uuid: string;          // Qual benefício ativar (ex: VR)
    user_info_uuids: string[];       // Lista de IDs dos funcionários para ativar
};