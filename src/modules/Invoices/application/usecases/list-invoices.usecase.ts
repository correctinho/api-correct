import { CustomError } from "../../../../errors/custom.error";
import { ListInvoicesInputDTO, ListInvoicesOutputDTO, InvoiceOutput } from "../dtos/list-invoices.dto";
import { IInvoicesRepository } from "../../domain/interfaces/invoices-repository.interface";

export class ListInvoicesUsecase {
  constructor(private invoicesRepository: IInvoicesRepository) {}

  async execute(input: ListInvoicesInputDTO): Promise<ListInvoicesOutputDTO> {
    const page = Number(input.page) > 0 ? Number(input.page) : 1;
    const limit = Number(input.limit) > 0 ? Number(input.limit) : 10;

    const { data, count } = await this.invoicesRepository.listInvoices({
      ...input,
      page,
      limit,
    });

    const formattedData: InvoiceOutput[] = data.map((invoice: any) => ({
      uuid: invoice.uuid,
      business_info_uuid: invoice.business_info_uuid,
      fantasy_name: invoice.BusinessInfo?.fantasy_name || "",
      reference_month: invoice.reference_month,
      cycle_start_date: invoice.cycle_start_date,
      cycle_end_date: invoice.cycle_end_date,
      due_date: invoice.due_date,
      total_amount: invoice.total_amount / 100,
      status: invoice.status,
      paid_at: invoice.paid_at,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at,
    }));

    return {
      data: formattedData,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}
