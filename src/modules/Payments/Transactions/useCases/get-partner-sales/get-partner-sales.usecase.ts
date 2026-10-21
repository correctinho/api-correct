import { GetPartnerSalesRequestDTO, GetPartnerSalesResponseDTO } from "./get-partner-sales.dto";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { CustomError } from "../../../../../errors/custom.error";

export class GetPartnerSalesUseCase {
  constructor(private readonly transactionRepository: ITransactionOrderRepository) { }

  async execute(data: GetPartnerSalesRequestDTO): Promise<GetPartnerSalesResponseDTO> {
    const { business_info_uuid, page, limit } = data;

    if (!business_info_uuid) {
      throw new CustomError("Business Info UUID is required.", 400);
    }

    const { data: formattedTransactions, totalCount, totalPages } = await this.transactionRepository.findPartnerSalesPaginated(
      business_info_uuid,
      page,
      limit
    );

    return {
      data: formattedTransactions,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        limit
      }
    };
  }
}
