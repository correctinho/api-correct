import { CustomError } from "../../../../../errors/custom.error";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import {
  InputGetPOSTransactionStatusDTO,
  OutputGetPOSTransactionStatusDTO,
} from "./dto/get-pos-transaction-status.dto";

export class GetPOSTransactionStatusUseCase {
  constructor(
    private readonly transactionOrderRepository: ITransactionOrderRepository
  ) {}

  async execute(
    data: InputGetPOSTransactionStatusDTO
  ): Promise<OutputGetPOSTransactionStatusDTO> {
    if (!data.transactionId) {
      throw new CustomError("Transaction ID is required", 400);
    }

    const tx = await this.transactionOrderRepository.findStatusById(data.transactionId);

    if (!tx) {
      throw new CustomError("Transaction not found", 404);
    }

    if (
      tx.favored_business_info_uuid &&
      tx.favored_business_info_uuid !== data.business_info_uuid
    ) {
      throw new CustomError("Access denied to this transaction", 403);
    }

    let code = 0;
    switch (tx.status) {
      case "pending":
        code = 0;
        break;
      case "success":
        code = 1;
        break;
      case "cancelled":
        code = 2;
        break;
      case "fail":
        code = 3;
        break;
      default:
        code = 0;
    }

    return {
      code,
      status: tx.status,
    };
  }
}
