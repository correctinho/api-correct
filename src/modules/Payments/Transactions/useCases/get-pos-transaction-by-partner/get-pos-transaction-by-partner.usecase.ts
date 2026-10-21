import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";
import { InputGetTransactionByPartnerDTO, OutputGetTransactionByPartnerDTO } from "./get-pos-transaction-by-partner.dto";

export class GetPOSTransactionByPartnerUsecase {
  constructor(
    private transactionOrderRepository: ITransactionOrderRepository,
    private businessInfoRepository: ICompanyDataRepository
  ) { }

  async execute(data: InputGetTransactionByPartnerDTO): Promise<OutputGetTransactionByPartnerDTO> {
    if (!data.transactionId) {
      throw new CustomError("Transaction ID is required", 400);
    }

    const transaction = await this.transactionOrderRepository.find(new Uuid(data.transactionId));
    if (!transaction) throw new CustomError("Transaction not found", 404);

    if (!transaction.favored_business_info_uuid) {
      throw new CustomError("Transaction is missing partner information", 400);
    }

    if(transaction.status !== 'pending') {
      throw new CustomError(`Invalid transaction status (${transaction.status}) - Please, request a new transaction`, 400);
    }

    const businessInfo = await this.businessInfoRepository.findById(transaction.favored_business_info_uuid.uuid);
    if (!businessInfo) throw new CustomError("Business info not found", 404);

    return {
      transaction_uuid: transaction.uuid.uuid,
      fantasy_name: businessInfo.fantasy_name,
      amount: transaction.net_price,
      created_at: transaction.created_at
    };
  }
}
