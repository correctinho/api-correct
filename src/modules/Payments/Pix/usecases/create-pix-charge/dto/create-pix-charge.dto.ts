// DTO de Entrada: os dados que o controller enviará para o usecase
export interface InputCreatePixChargeDTO {
    userId: string; // UUID do AppUser autenticado
    amountInReais: number; // Valor que o usuário deseja adicionar, ex: 50.50
}

// DTO de Saída: os dados que o usecase retornará para o controller
export interface OutputCreatePixChargeDTO {
    transactionId: string; // O UUID da nossa transação interna
    pixCopyPaste: string;  // O código "Pix Copia e Cola"
}