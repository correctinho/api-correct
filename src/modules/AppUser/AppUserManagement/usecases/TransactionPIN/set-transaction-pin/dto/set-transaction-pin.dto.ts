// DTO de Entrada: Contém os dados que o frontend enviará.
export interface InputSetAppUserPinDTO {
    userId: string;          // Vindo do token de autenticação
    newPin: string;          // O novo PIN de 4 ou 6 dígitos
    password?: string;       // A senha de login do usuário, para confirmar a identidade na criação/alteração
}

// DTO de Saída: Uma confirmação simples de sucesso.
export interface OutputSetAppUserPinDTO {
    success: boolean;
    message: string;
}