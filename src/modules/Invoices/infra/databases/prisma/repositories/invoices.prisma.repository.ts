import { prismaClient } from "../../../../../../infra/databases/prisma.config";
import { IInvoicesRepository } from "../../../../domain/interfaces/invoices-repository.interface";
import { ListInvoicesInputDTO } from "../../../../application/dtos/list-invoices.dto";
import { EmployerInvoice, InvoiceStatus } from "@prisma/client";

export class InvoicesPrismaRepository implements IInvoicesRepository {
  async listInvoices(filters: ListInvoicesInputDTO): Promise<{ data: any[]; count: number }> {
    const { page, limit, status, business_info_uuid, reference_month } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status as InvoiceStatus;
    }

    if (business_info_uuid) {
      where.business_info_uuid = business_info_uuid;
    }

    if (reference_month) {
      where.reference_month = reference_month;
    }

    const [data, count] = await prismaClient.$transaction([
      prismaClient.employerInvoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          BusinessInfo: {
            select: {
              fantasy_name: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      }),
      prismaClient.employerInvoice.count({ where }),
    ]);

    return { data, count };
  }

  async findInvoiceById(uuid: string): Promise<EmployerInvoice | null> {
    return prismaClient.employerInvoice.findUnique({
      where: { uuid },
    });
  }

  async payInvoice(uuid: string): Promise<EmployerInvoice> {
    return prismaClient.employerInvoice.update({
      where: { uuid },
      data: {
        status: InvoiceStatus.PAID,
        paid_at: new Date(),
      },
    });
  }
}

