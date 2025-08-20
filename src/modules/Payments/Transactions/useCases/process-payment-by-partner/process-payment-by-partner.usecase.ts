import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IPartnerCreditRepository } from "../../../Accounts/repositories/partner-credit.repository";
import { IBusinessAccountRepository } from "../../../Accounts/usecases/repositories/business-account.repository";
import { TransactionEntity } from "../../entities/transaction-order.entity";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { InputProcessPaymentByPartnerDTO, OutputProcessPaymentByPartnerDTO } from "./dto/process-payment-by-partner.dto";

export class ProcessPaymentByPartnerUsecase {

  constructor(
    private readonly transactionRepository: ITransactionOrderRepository,
    private readonly businessAccountRepository: IBusinessAccountRepository,
    private readonly partnerCreditRepository: IPartnerCreditRepository
  ) { }

  public async execute(input: InputProcessPaymentByPartnerDTO): Promise<OutputProcessPaymentByPartnerDTO> {

    // 1. Validações de entrada
    if (!input.transactionId || !input.payerBusinessInfoId) {
      throw new CustomError("Dados da transação ou do pagador estão ausentes.", 400);
    }

    // 2. Busca a transação pendente
    const transactionEntity = await this.transactionRepository.find(new Uuid(input.transactionId));
    if (!transactionEntity || transactionEntity.status !== 'pending') {
      throw new CustomError("Transação não encontrada ou já processada.", 404);
    }
    const sellerBusinessInfoId = transactionEntity.favored_business_info_uuid;
    if (!sellerBusinessInfoId) {
      throw new CustomError("Parceiro favorecido não encontrado na transação.", 400);
    }

    // 3. Busca os "fundos" do parceiro pagador
    const payerAccount = await this.businessAccountRepository.findByBusinessId(input.payerBusinessInfoId);
    if (!payerAccount) {
      throw new CustomError("Conta do parceiro pagador não encontrada.", 404);
    }
    const payerCredits = await this.partnerCreditRepository.findAllSpendableByAccountId(payerAccount.uuid.uuid);

    const liquidBalanceInCents = payerAccount.toJSON().balance;
    const creditBalanceInCents = payerCredits.reduce((sum, credit) => sum + credit.toJSON().balance, 0);
    const totalAvailableInCents = liquidBalanceInCents + creditBalanceInCents;
    const netPriceInCents = transactionEntity.toJSON().net_price;

    if (totalAvailableInCents < netPriceInCents) {
      throw new CustomError("Saldo total (líquido + créditos) insuficiente para esta compra.", 402);
    }

    // 5. Delega a execução da transação para o repositório
    const result = await this.transactionRepository.processPaymentByBusiness({
      transaction: transactionEntity,
      payerAccount: payerAccount,
      payerCredits: payerCredits,
      sellerBusinessInfoId: sellerBusinessInfoId.uuid
    });

    return {
      success: true,
      transactionId: input.transactionId,
      netAmountPaid: transactionEntity.net_price, // Getter já retorna em Reais
      amountPaidFromCredits: result.amountPaidFromCredits / 100, // Repo retorna centavos
      amountPaidFromLiquidBalance: result.amountPaidFromLiquidBalance / 100, // Repo retorna centavos
      payerFinalLiquidBalance: result.payerFinalLiquidBalance / 100 // Repo retorna centavos
    };
  }
}