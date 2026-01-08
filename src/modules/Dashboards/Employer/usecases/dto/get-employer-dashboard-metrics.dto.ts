export interface OutputEmployerDashboardMetricsDTO {
    overview: {
        total_benefits: number;      // Total de benefícios ativos
        custom_benefits: number;     // Total de personalizados ativos
        total_lives: number;         // Total de colaboradores vinculados
        estimated_monthly_cost: number; // Valor total em centavos
    };
    distribution: {
        category: string;
        amount: number; // Valor em centavos por categoria
    }[];
}