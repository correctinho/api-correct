import { 
    startOfDay, 
    endOfDay, 
    startOfMonth, 
    endOfMonth, 
    subMonths, 
    subDays, 
    format 
} from "date-fns";
import { IPartnerDashboardRepository } from "../repositories/partner-dashboard.repository";
import { DailyChartData, OutputGetPartnerDashboardDTO } from "./dto/get-partner-dashboard.dto";
import { CustomError } from "../../../../errors/custom.error";

export class GetPartnerDashboardUseCase {
    constructor(
        private partnerDashboardRepository: IPartnerDashboardRepository
    ) {}

    async execute(businessInfoUuid: string): Promise<OutputGetPartnerDashboardDTO> {
        if (!businessInfoUuid) {
            throw new CustomError("Business ID is required to fetch dashboard data.", 400);
        }

        const now = new Date();

        // 1. Definição de Intervalos de Tempo
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);

        const currentMonthStart = startOfMonth(now);
        const currentMonthEnd = endOfMonth(now);

        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        // Para o gráfico: últimos 7 dias (incluindo hoje)
        const chartStart = startOfDay(subDays(now, 6));
        const chartEnd = endOfDay(now);

        // 2. Buscas em Paralelo (Performance)
        const [
            todayMetrics,
            currentMonthMetrics,
            lastMonthMetrics,
            dailyRevenueData,
            recentTransactions
        ] = await Promise.all([
            // Métricas de Hoje
            this.partnerDashboardRepository.getAggregateMetrics(businessInfoUuid, todayStart, todayEnd),
            // Métricas do Mês Atual
            this.partnerDashboardRepository.getAggregateMetrics(businessInfoUuid, currentMonthStart, currentMonthEnd),
            // Métricas do Mês Passado (para comparação)
            this.partnerDashboardRepository.getAggregateMetrics(businessInfoUuid, lastMonthStart, lastMonthEnd),
            // Dados do Gráfico
            this.partnerDashboardRepository.getDailyRevenue(businessInfoUuid, chartStart, chartEnd),
            // Últimas Transações
            this.partnerDashboardRepository.findRecentTransactions(businessInfoUuid, 5)
        ]);

        // 3. Cálculos de Crescimento (Growth %)
        const currentRevenue = currentMonthMetrics.totalRevenue;
        const lastRevenue = lastMonthMetrics.totalRevenue;
        
        let revenueGrowth = 0;
        if (lastRevenue > 0) {
            revenueGrowth = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
        } else if (currentRevenue > 0) {
            revenueGrowth = 100; // Crescimento infinito se saiu de zero
        }

        const currentTxCount = currentMonthMetrics.transactionCount;
        const lastTxCount = lastMonthMetrics.transactionCount;

        let txGrowth = 0;
        if (lastTxCount > 0) {
            txGrowth = ((currentTxCount - lastTxCount) / lastTxCount) * 100;
        }

        // 4. Ticket Médio
        const averageTicket = currentTxCount > 0 
            ? currentRevenue / currentTxCount 
            : 0;

        // 5. Preenchimento do Gráfico (Garantir que dias com 0 vendas apareçam)
        // O repositório retorna apenas dias com vendas. O frontend precisa de todos os dias.
        const filledChartData: DailyChartData[] = [];
        
        // Mapa auxiliar para busca rápida O(1)
        const revenueMap = new Map<string, number>();
        dailyRevenueData.forEach(item => revenueMap.set(item.date, item.amount));

        // Loop pelos últimos 7 dias
        for (let i = 6; i >= 0; i--) {
            const date = subDays(now, i);
            const dateKey = format(date, 'yyyy-MM-dd'); // Chave usada no Map
            const displayDate = format(date, 'dd/MM');  // Formato para o Frontend

            filledChartData.push({
                date: displayDate,
                amount: revenueMap.get(dateKey) || 0 // Se não tiver no mapa, é zero
            });
        }

        // 6. Formatação da Lista de Transações
        // Como o Repository retorna TransactionEntity, aqui transformamos em JSON simples para o DTO
        const formattedRecentTransactions = recentTransactions.map(tx => {
            // Nota: Se a entidade não tiver o nome do pagador hidratado, retornamos um fallback
            // Para ter o nome, precisaríamos que o Entity suportasse ou retornasse um DTO extendido.
            // Aqui assumimos que o frontend vai receber o básico.
            return {
                uuid: tx.uuid.uuid,
                amount: tx.net_price, // Valor pago
                status: tx.status,
                created_at: tx.created_at,
                // Fallback simples, já que a entidade TransactionEntity pura não tem o campo 'payerName'
                // Se precisar muito do nome, podemos ajustar o DTO de retorno do UseCase
                payerName: 'Cliente' 
            };
        });

        // 7. Retorno Final
        return {
            kpis: {
                currentMonth: {
                    totalRevenue: currentRevenue,
                    transactionCount: currentTxCount,
                    averageTicket: Number(averageTicket.toFixed(2))
                },
                growth: {
                    revenuePercentage: Number(revenueGrowth.toFixed(2)),
                    transactionsPercentage: Number(txGrowth.toFixed(2))
                },
                today: {
                    totalRevenue: todayMetrics.totalRevenue,
                    transactionCount: todayMetrics.transactionCount
                }
            },
            salesChart: filledChartData,
            recentTransactions: formattedRecentTransactions
        };
    }
}