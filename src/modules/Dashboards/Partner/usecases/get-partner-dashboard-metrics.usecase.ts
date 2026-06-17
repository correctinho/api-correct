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
    ) { }

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
            recentTransactions,
            operatorRanking // NOVO: Busca o Ranking
        ] = await Promise.all([
            this.partnerDashboardRepository.getAggregateMetrics(businessInfoUuid, todayStart, todayEnd),
            this.partnerDashboardRepository.getAggregateMetrics(businessInfoUuid, currentMonthStart, currentMonthEnd),
            this.partnerDashboardRepository.getAggregateMetrics(businessInfoUuid, lastMonthStart, lastMonthEnd),
            this.partnerDashboardRepository.getDailyRevenue(businessInfoUuid, chartStart, chartEnd),
            this.partnerDashboardRepository.findRecentTransactions(businessInfoUuid, 5),
            this.partnerDashboardRepository.getOperatorRanking(businessInfoUuid, currentMonthStart, currentMonthEnd) // NOVO
        ]);

        // 3. Cálculos de Crescimento (Growth %)
        const currentRevenue = currentMonthMetrics.totalRevenue;
        const lastRevenue = lastMonthMetrics.totalRevenue;

        let revenueGrowth = 0;
        if (lastRevenue > 0) {
            revenueGrowth = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
        } else if (currentRevenue > 0) {
            revenueGrowth = 100;
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

        // 5. Preenchimento do Gráfico
        const filledChartData: DailyChartData[] = [];
        const revenueMap = new Map<string, number>();
        dailyRevenueData.forEach(item => revenueMap.set(item.date, item.amount));

        for (let i = 6; i >= 0; i--) {
            const date = subDays(now, i);
            const dateKey = format(date, 'yyyy-MM-dd');
            const displayDate = format(date, 'dd/MM');

            filledChartData.push({
                date: displayDate,
                amount: (revenueMap.get(dateKey) || 0) / 100
            });
        }

        // 6. Formatação da Lista de Transações e Ranking
        const formattedRecentTransactions = recentTransactions.map(item => {
            return {
                uuid: item.entity.uuid.uuid,
                amount: item.entity.net_price, // Entity já divide por 100
                status: item.entity.status,
                created_at: item.entity.created_at,
                payerName: item.payerName,
                operatorName: item.operatorName // O Nome de quem vendeu!
            };
        });

        const formattedRanking = operatorRanking.map(op => ({
            name: op.name,
            amount: op.amount / 100, // Converte centavos do BD para Reais
            count: op.count
        }));

        // 7. Retorno Final
        return {
            kpis: {
                currentMonth: {
                    totalRevenue: currentRevenue / 100,
                    transactionCount: currentTxCount,
                    averageTicket: Number((averageTicket / 100).toFixed(2))
                },
                growth: {
                    revenuePercentage: Number(revenueGrowth.toFixed(2)),
                    transactionsPercentage: Number(txGrowth.toFixed(2))
                },
                today: {
                    totalRevenue: todayMetrics.totalRevenue / 100,
                    transactionCount: todayMetrics.transactionCount
                }
            },
            salesChart: filledChartData,
            operatorRanking: formattedRanking, // Novo array devolvido pro Frontend!
            recentTransactions: formattedRecentTransactions
        };
    }
}