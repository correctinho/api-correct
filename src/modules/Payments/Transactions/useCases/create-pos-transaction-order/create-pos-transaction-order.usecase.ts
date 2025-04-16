import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IBusinessItemDetailsRepository } from "../../../../Company/BusinessItemsDetails/repositories/business-item-details.repository";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";
import { IPartnerConfigRepository } from "../../../../Company/PartnerConfig/repositories/partner-config.repository";
import { TransactionEntity } from "../../entities/transaction-order.entity";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { InputCreatePOSTransactionByBusinessDTO, OutputCreatePOSTransactionByBusinessDTO } from "../../transactions-dto/transactions.dto";

export class CreatePOSTransactionOrderUsecase {
  constructor(
    private businessInfoRepository: ICompanyDataRepository,
    private transactionOrderRepository: ITransactionOrderRepository,
    private partnerConfigRepository: IPartnerConfigRepository,
  ) { }

  async execute(data: InputCreatePOSTransactionByBusinessDTO): Promise<OutputCreatePOSTransactionByBusinessDTO> {
    // Get business info
    const businessInfo = await this.businessInfoRepository.findById(data.business_info_uuid)
    if (!businessInfo) throw new CustomError("Business not found", 400)


    // Check if business is active
    if (businessInfo.status !== 'active') throw new CustomError("Business is not active", 403)

    //check business type
    if (businessInfo.business_type === 'empregador') throw new CustomError("Business type is not allowed", 403)

    //Get partner config details
    const partnerConfig = await this.partnerConfigRepository.findByPartnerId(businessInfo.uuid)
    if (!partnerConfig) throw new CustomError("Partner config not found", 400)
    // Calculate fee
    const fee = await this.calculateFee(partnerConfig.admin_tax, partnerConfig.marketing_tax)

    data.transaction_type = 'POS_PAYMENT'

    const transactionEntity = TransactionEntity.create(data)
    // Now we need to check if item provided is accepted by business
    await this.checkPartnerItem(partnerConfig.items_uuid, data.item_uuid)

    transactionEntity.changeBusinessInfoUuid(new Uuid(data.business_info_uuid))
    transactionEntity.changeFeeAmount(fee)

    const transaction = await this.transactionOrderRepository.save(transactionEntity)

    return {
      transaction_uuid: transaction.uuid.uuid,
      business_info_uuid: transaction.favored_business_info_uuid.uuid,
      fee: transaction.fee_amount / 100,
      created_at: transaction.created_at
    }
  }

  private async calculateFee(admin_tax: number, marketing_tax: number) {
    const fee = admin_tax + marketing_tax
    return fee
  }

  private async checkPartnerItem(items_uuid: string[], item_uuid: string) {
    const item = items_uuid.find((item) => item === item_uuid)
    if (!item) throw new CustomError("Item not accepted by the business", 403)

  }

}
