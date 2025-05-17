import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { calculateSplitPrePaidAmount } from "../../../../../paymentSplit/prePaidSplit";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";
import { IPartnerConfigRepository } from "../../../../Company/PartnerConfig/repositories/partner-config.repository";
import { TransactionEntity } from "../../entities/transaction-order.entity";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { InputProcessPaymentDTO } from "./dto/process-payment-by-app-user.dto";

export class ProcessPaymentByAppUserUsecase {
  constructor(
    private transactionOrderRepository: ITransactionOrderRepository,
    private userItemRepository: IAppUserItemRepository,
    private partnerConfigRepository: IPartnerConfigRepository,
  ) { }

  async execute(data: InputProcessPaymentDTO): Promise<any> {

    if (!data.transactionId) {
      throw new CustomError("Transaction ID is required", 400);
    }
    if (!data.benefit_uuid) throw new CustomError("Benefit UUID is required", 400);

    //get transaction details
    const transaction = await this.transactionOrderRepository.find(new Uuid(data.transactionId));
    if (!transaction) throw new CustomError("Transaction not found", 404);
    console.log({transaction})
    // Ensure transaction has the favored business info needed
    if (!transaction.favored_business_info_uuid) {
      throw new CustomError("Transaction is missing partner information", 400);
    }

    //check if user has the benefit
    const userItem = await this.userItemRepository.find(new Uuid(data.benefit_uuid));
    if (!userItem) throw new CustomError("User item not found", 404);
    //double validation if user item is from the same user
    if (userItem.user_info_uuid.uuid !== data.appUserInfoID) throw new CustomError("User item is not from this user", 403);

    //check benefit status
    if (userItem.status === "inactive" || userItem.status === "blocked") throw new CustomError("User item is not active", 403);

    //check if user has enough balance
    if (userItem.balance < transaction.amount) throw new CustomError("User item balance is not enough", 403);

    //check if user benefit can be paid in this transaction
    const partnerConfig = await this.partnerConfigRepository.findByPartnerId(transaction.favored_business_info_uuid.uuid);
    if (!partnerConfig) throw new CustomError("Partner not found", 404);
    console.log({partnerConfig})

    const isBenefitValid = partnerConfig.items_uuid.some((item) => item === userItem.item_uuid.uuid);
    if (!isBenefitValid) throw new CustomError("User item is not valid for this transaction", 403);

    //*********TO BE IMPLEMENTED*********
    //check if partner is in user block list
    //*********TO BE IMPLEMENTED*********


    const splitInput = {
      totalAmount: transaction.amount,
      admin_tax: partnerConfig.admin_tax,
      marketing_tax: partnerConfig.marketing_tax,
      marketplace_tax: partnerConfig.market_place_tax,
      partner_cashback_tax: partnerConfig.cashback_tax,
    }

    const splitOutput = await calculateSplitPrePaidAmount(splitInput);
    console.log({splitOutput})

    const transactionEntity = new TransactionEntity(transaction)

    transactionEntity.changeUserItemUuid(new Uuid(data.benefit_uuid));

    //check if benefit is pos ou pre paid
    if (userItem.item_category === "pre_pago") {
      //if it is pre paid, amount is immediately transfered to partner
      console.log("Chegou aqui ***********")
      try{

        const processSplitPrePaidPayment = await this.transactionOrderRepository.processSplitPrePaidPayment(
          transactionEntity,
          splitOutput,
          new Uuid(data.appUserInfoID)
        )
        return {result: processSplitPrePaidPayment.success, finalBalance: processSplitPrePaidPayment.finalDebitedUserItemBalance}
      }catch(err){
        return err
      }

      return {

      }

    } {
      //else, amount must go to credits
      // TODO: Implementar lógica pós-pago/crédito
    }

  }

  //logic to process payment by app user

}
