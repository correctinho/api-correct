import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { IEmployerDashboardRepository } from "../employer-dashboard.repository";

export class EmployerDashboardPrismaRepository implements IEmployerDashboardRepository {
    async getDashboardMetrics(businessInfoUuid: string): Promise<{
        fantasy_name: string;
        overview: {
            total_benefits: number;
            custom_benefits: number;
            total_lives: number;
            estimated_monthly_cost: number;
            postpaid_current_invoice: number;
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
                BusinessInfo: {
                    select: { fantasy_name: true }
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

        let fantasyName = "";
        if (activeBenefits.length > 0) {
            fantasyName = activeBenefits[0].BusinessInfo.fantasy_name;
        } else {
            const business = await prismaClient.businessInfo.findUnique({
                where: { uuid: businessInfoUuid },
                select: { fantasy_name: true }
            });
            fantasyName = business?.fantasy_name || "Empresa não encontrada";
        }
        // 2. PROCESSAMENTO EM MEMÓRIA (Zero novas chamadas ao banco)

        // A. Contagens Simples
        const totalBenefits = activeBenefits.length;

        // Conta quantos têm business_info_uuid preenchido no Item pai (são os personalizados)
        const customBenefits = activeBenefits.filter(
            b => b.Item.business_info_uuid !== null
        ).length;

        // B. Cálculos Financeiros e Vidas
        
        
        // Cálculo de Vidas Únicas
        const uniqueUsers = await prismaClient.userItem.findMany({
            where: {
                business_info_uuid: businessInfoUuid,
                status: 'active'
            },
            select: { user_info_uuid: true },
            distinct: ['user_info_uuid']
        });
        const totalLives = uniqueUsers.length;

        let totalCost = 0;
        let totalPostpaidInvoice = 0;
        const categoryMap: Record<string, number> = {};

        for (const benefit of activeBenefits) {
            let benefitCost = 0;

            // Itera sobre os grupos configurados (Padrão, Gerência, etc)
            for (const group of benefit.BenefitGroups) {
                const livesInGroup = group.UserItem.length;
                const groupValue = group.value || 0;

                // Custo = Vidas * Valor
                benefitCost += (livesInGroup * groupValue);
            }

            // Soma ao Custo Fixo Mensal APENAS se for pré-pago
            if (benefit.Item.item_category === 'pre_pago') {
                totalCost += benefitCost;
            } else if (benefit.Item.item_category === 'pos_pago') {
                // Aqui armazenamos a exposição máxima (limite total) e não o gasto
                totalPostpaidInvoice += benefitCost;
            }

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
            fantasy_name: fantasyName,
            overview: {
                total_benefits: totalBenefits,    // Apenas ativos
                custom_benefits: customBenefits,  // Apenas ativos personalizados
                total_lives: totalLives,
                postpaid_current_invoice: totalPostpaidInvoice,          // Vidas em benefícios ativos
                estimated_monthly_cost: totalCost // Custo real da folha
            },
            distribution
        };
    }
}