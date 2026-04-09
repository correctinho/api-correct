import { prismaClient } from "../../../../infra/databases/prisma.config";
import { IDashboardRepository } from "../dashboard.repository";
import { InvoiceStatus, BusinessStatus, BusinessTypeOptions } from "@prisma/client";

export class DashboardPrismaRepository implements IDashboardRepository {
  async getRevenueByReferenceMonth(referenceMonth: string): Promise<number> {
    const result = await prismaClient.employerInvoice.aggregate({
      _sum: {
        total_amount: true,
      },
      where: {
        reference_month: referenceMonth,
        status: InvoiceStatus.PAID,
      },
    });

    return result._sum.total_amount || 0;
  }

  async getOverdueAmount(currentDate: Date): Promise<number> {
    const result = await prismaClient.employerInvoice.aggregate({
      _sum: {
        total_amount: true,
      },
      where: {
        status: InvoiceStatus.PENDING,
        due_date: {
          lt: currentDate,
        },
      },
    });

    return result._sum.total_amount || 0;
  }

  async getActiveBusinessCount(businessType: "comercio" | "empregador"): Promise<number> {
    return prismaClient.businessInfo.count({
      where: {
        status: BusinessStatus.active,
        business_type: businessType as BusinessTypeOptions,
      },
    });
  }

  async getTopBranchesByTransactions(startDate: string, endDate: string, limit: number): Promise<any[]> {
    // We use a raw query because grouping by a nested relation isn't natively supported in a single findMany.
    // We want the branch_info of the favored partner business_info for successful transactions.
    const topBranches = await prismaClient.$queryRaw`
      SELECT b.uuid, b.name, CAST(COUNT(t.uuid) AS INTEGER) as transaction_count
      FROM transactions t
      JOIN "businessInfo_branch" bb ON t.favored_business_info_uuid = bb.business_info_uuid
      JOIN branch_info b ON bb.branch_info_uuid = b.uuid
      WHERE t.status = 'success' 
        AND t.created_at >= ${startDate} 
        AND t.created_at <= ${endDate}
      GROUP BY b.uuid, b.name
      ORDER BY transaction_count DESC
      LIMIT ${limit}
    `;

    return topBranches as any[];
  }
}
