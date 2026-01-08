export type OutputListBusinessOrdersDTO = {
    orders: {
        uuid: string;
        total_amount: number; // Em Reais
        status: string;       // PENDING, PAID, etc.
        created_at: Date;
        pix_key?: string;     // Opcional, caso queira exibir novamente
    }[];
}