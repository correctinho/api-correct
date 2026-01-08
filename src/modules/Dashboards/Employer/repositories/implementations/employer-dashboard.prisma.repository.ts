import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { IEmployerDashboardRepository } from "../employer-dashboard.repository";

export class EmployerDashboardPrismaRepository implements IEmployerDashboardRepository {
    async getDashboardMetrics(businessInfoUuid: string): Promise<{
        overview: {
            total_benefits: number;
            custom_benefits: number;
            total_lives: number;
            estimated_monthly_cost: number;
        },
        distribution: {
            category: string;
            amount: number;
        }[]
    }> {
        // 1. ÚNICA QUERY: Busca TUDO que é ATIVO.
        const activeBenefits = await prismaClient.employerItemDetails.findMany({
            where: {
                business_info_uuid: businessInfoUuid,
                is_active: true // FILTRO CRUCIAL: Só traz o que o RH vê
            },
            include: {
                Item: {
                    select: { item_category: true, business_info_uuid: true }
                },
                // Entramos nos Grupos -> UserItems para calcular o custo real
                BenefitGroups: {
                    include: {
                        UserItem: {
                            where: { status: 'active' } // Só conta colaborador ativo pagando
                        }
                    }
                }
            }
        });

        // 2. PROCESSAMENTO EM MEMÓRIA (Zero novas chamadas ao banco)

        // A. Contagens Simples
        const totalBenefits = activeBenefits.length;

        // Conta quantos têm business_info_uuid preenchido no Item pai (são os personalizados)
        const customBenefits = activeBenefits.filter(
            b => b.Item.business_info_uuid !== null
        ).length;

        // B. Cálculos Financeiros e Vidas
        let totalLives = 0;
        let totalCost = 0;
        const categoryMap: Record<string, number> = {};

        for (const benefit of activeBenefits) {
            let benefitCost = 0;

            // Itera sobre os grupos configurados (Padrão, Gerência, etc)
            for (const group of benefit.BenefitGroups) {
                const livesInGroup = group.UserItem.length;
                const groupValue = group.value || 0;

                totalLives += livesInGroup;

                // Custo = Vidas * Valor
                benefitCost += (livesInGroup * groupValue);
            }

            totalCost += benefitCost;

            // Agrupa por categoria para o gráfico
            const category = benefit.Item.item_category || 'Outros';
            if (!categoryMap[category]) {
                categoryMap[category] = 0;
            }
            categoryMap[category] += benefitCost;
        }

        // 3. Formatação
        const distribution = Object.entries(categoryMap).map(([category, amount]) => ({
            category,
            amount // Valor em centavos
        }));

        return {
            overview: {
                total_benefits: totalBenefits,    // Apenas ativos
                custom_benefits: customBenefits,  // Apenas ativos personalizados
                total_lives: totalLives,          // Vidas em benefícios ativos
                estimated_monthly_cost: totalCost // Custo real da folha
            },
            distribution
        };
    }
}