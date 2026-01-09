export type CollaboratorItemDTO = {
    user_item_uuid: string;  // ID do item do usuário
    user_info_uuid: string; // ID do usuário (necessário para o checkbox de ação em massa)
    name: string;           // Nome do funcionário
    document: string;       // CPF
    status: string;         // 'active' | 'inactive' | 'blocked'
    group_name: string;     // Ex: "Grupo Padrão", "Diretoria"
    balance: number;        // Saldo atual em centavos (ou reais, dependendo da sua regra de exibição)
    admitted_at: string | Date | null; // Data de criação do vínculo
};

export type OutputListCollaboratorsDTO = {
    collaborators: CollaboratorItemDTO[];
    meta: {
        total: number;      // Total de registros no banco (para calcular paginação)
        page: number;       // Página atual
        last_page: number;  // Qual é a última página
        per_page: number;   // Itens por página
    };
};