import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";
import { IPartnerConfigRepository } from "../../../../Company/PartnerConfig/repositories/partner-config.repository";
import { TransactionEntity } from "../../entities/transaction-order.entity";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { InputCreatePOSTransactionByBusinessDTO, OutputCreatePOSTransactionByBusinessDTO } from "../../transactions-dto/transactions.dto";

//**********CREATE POINT OF SALE(POS) TRANSACTION*********** */
export class CreatePOSTransactionOrderUsecase {
  constructor(
    private businessInfoRepository: ICompanyDataRepository,
    private transactionOrderRepository: ITransactionOrderRepository,
    private partnerConfigRepository: IPartnerConfigRepository,
  ) { }

  async execute(data: InputCreatePOSTransactionByBusinessDTO): Promise<OutputCreatePOSTransactionByBusinessDTO> {
    data.transaction_type = 'POS_PAYMENT';

    if (!data.original_price) throw new CustomError("Original price is required", 400);
    if (data.discount_percentage === undefined || data.discount_percentage === null) throw new CustomError("Discount percentage is required", 400); if (!data.net_price) throw new CustomError("Net price is required", 400);

    if (data.original_price === 0) throw new CustomError("Original price cannot be zero", 400);

    // Get partner info
    const businessInfo = await this.businessInfoRepository.findById(data.business_info_uuid)
    if (!businessInfo) throw new CustomError("Business not found", 400)

    // Check if business is active
    if (businessInfo.status !== 'active') throw new CustomError("Business is not active", 403)

    //check business type is not employer
    if (businessInfo.business_type === 'empregador') throw new CustomError("Business type is not allowed", 403)

    //Get partner config details
    const partnerConfig = await this.partnerConfigRepository.findByPartnerId(businessInfo.uuid)
    if (!partnerConfig) throw new CustomError("Partner config not found", 400)
    
    const transactionEntity = TransactionEntity.create(data)

    // Calculate fee
    transactionEntity.calculateFeePercentage(partnerConfig.admin_tax, partnerConfig.marketing_tax)
    transactionEntity.calculateFee()


    //set favored partner business info uuid
    transactionEntity.changeFavoredBusinessInfoUuid(new Uuid(data.business_info_uuid))

    //set partner user uuid
    transactionEntity.changePartnerUserUuid(new Uuid(data.partner_user_uuid))

    transactionEntity.changeDescription("Transação do ponto de venda (POS)")
    const transaction = await this.transactionOrderRepository.savePOSTransaction(transactionEntity)
    return {
      transaction_uuid: transaction.uuid.uuid,
      user_item_uuid: transaction.user_item_uuid ? transaction.user_item_uuid.uuid : null,
      favored_user_uuid: transaction.favored_user_uuid ? transaction.favored_user_uuid.uuid : null,
      favored_business_info_uuid: transaction.favored_business_info_uuid ? transaction.favored_business_info_uuid.uuid : null,
      original_price: transaction.original_price,
      discount_percentage: transaction.discount_percentage,
      net_price: transaction.net_price,
      fee_percentage: transaction.fee_percentage,
      fee_amount: transaction.fee_amount,
      cashback: transaction.cashback,
      description: transaction.description,
      transaction_status: transaction.status,
      transaction_type: transaction.transaction_type,
      favored_partner_user_uuid: transaction.favored_partner_user_uuid ? transaction.favored_partner_user_uuid.uuid : null,
      paid_at: transaction.paid_at,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at ? transaction.updated_at : null
    }
  }

}
