import { EmployerInvoice } from "@prisma/client";
import { ListInvoicesInputDTO } from "../../application/dtos/list-invoices.dto";

export interface IInvoicesRepository {
  listInvoices(filters: ListInvoicesInputDTO): Promise<{ data: any[], count: number }>;
  findInvoiceById(uuid: string): Promise<EmployerInvoice | null>;
  payInvoice(uuid: string): Promise<EmployerInvoice>;
}
