export interface IEmployerDashboardRepository {
    getDashboardMetrics(businessInfoUuid: string): Promise<{
        fantasy_name: string
        overview: {
            total_benefits: number;
            custom_benefits: number;
            total_lives: number;       // NOVO
            estimated_monthly_cost: number; // NOVO
        },
        distribution: { // NOVO (Para o Gráfico)
            category: string;
            amount: number; // Valor financeiro alocado naquela categoria
        }[]
    }>
}