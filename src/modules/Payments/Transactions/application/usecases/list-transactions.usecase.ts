import { IListTransactionsRepository } from '../../domain/repositories/list-transactions.repository.interface';
import { InputListTransactionsDto, OutputListTransactionsDto } from './dto/list-transactions.dto';

export class ListTransactionsUsecase {
  constructor(private readonly listTransactionsRepository: IListTransactionsRepository) { }

  async execute(input: InputListTransactionsDto): Promise<OutputListTransactionsDto> {
    const page = input.page && Number(input.page) > 0 ? Number(input.page) : 1;
    const limit = input.limit && Number(input.limit) > 0 ? Number(input.limit) : 20;

    const { transactions, total, aggregates } = await this.listTransactionsRepository.findAllPaginated({
      ...input,
      page,
      limit
    });

    const total_pages = Math.ceil(total / limit);

    // Mapeando a lista para exibir tudo na tabela
    const mappedData = transactions.map((t: any) => ({
      uuid: t.uuid,
      amount: (t.original_price ?? 0) / 100,            // Valor Bruto
      net_price: (t.net_price ?? 0) / 100,              // Valor Líquido
      platform_fee: (t.platform_net_fee_amount ?? 0) / 100, // Lucro Correct
      cashback: (t.cashback ?? 0) / 100,                // NOVO: Cashback pago
      transaction_type: t.transaction_type,
      status: t.status,
      created_at: t.created_at,
      paid_at: t.paid_at || null,
      favored_business_info_uuid: t.favored_business_info_uuid || null,
      favored_business_name: t.BusinessInfo?.fantasy_name || 'Não informado',
    }));

    return {
      data: mappedData,
      meta: {
        total_records: total,
        current_page: page,
        total_pages,
        // Agregados financeiros formatados em Reais para os "Cards" do Admin
        financial_summary: {
          total_amount: aggregates.total_original_price_cents / 100,
          total_net_price: aggregates.total_net_price_cents / 100,
          total_platform_fee: aggregates.total_platform_fee_cents / 100,
          total_cashback: aggregates.total_cashback_cents / 100,
        }
      }
    };
  }
}