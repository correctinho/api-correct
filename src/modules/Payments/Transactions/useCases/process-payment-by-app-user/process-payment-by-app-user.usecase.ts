import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { IPasswordCrypto } from "../../../../../crypto/password.crypto";
import { CustomError } from "../../../../../errors/custom.error";
import { sseSendEvent } from "../../../../../infra/sse/sse.config";
import { IAppUserAuthRepository } from "../../../../AppUser/AppUserManagement/repositories/app-use-auth-repository";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { IPartnerConfigRepository } from "../../../../Company/PartnerConfig/repositories/partner-config.repository";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { InputProcessPaymentDTO } from "./dto/process-payment-by-app-user.dto";

export class ProcessPaymentByAppUserUsecase {
  constructor(
    private transactionOrderRepository: ITransactionOrderRepository,
    private userItemRepository: IAppUserItemRepository,
    private partnerConfigRepository: IPartnerConfigRepository,
    private readonly hashService: IPasswordCrypto
  ) { }

  async execute(data: InputProcessPaymentDTO): Promise<any> {
    if (!data.transactionId) throw new CustomError("Transaction ID is required", 400);
    if (!data.benefit_uuid) throw new CustomError("Benefit UUID is required", 400);
    if (!data.incoming_pin) throw new CustomError("Transaction PIN is required", 400);
    if (!data.existing_pin) throw new CustomError("User does not have a transaction PIN set", 403);

    // 1. Validamos o PIN
    // existing pin vem do middleware (req.appUser.transaction_pin)
    // incoming pin vem do body (data.incoming_pin)
    const isPinValid = await this.hashService.compare(data.incoming_pin, data.existing_pin);
    if (!isPinValid) {
      throw new CustomError("Invalid Transaction PIN.", 403); // 403 Forbidden
    }

    // 2. Buscamos a ENTIDADE diretamente. O método find() já a retorna hidratada.
    const transactionEntity = await this.transactionOrderRepository.find(new Uuid(data.transactionId));
    if (!transactionEntity) throw new CustomError("Transaction not found", 404);

    if (!transactionEntity.favored_business_info_uuid) {
      throw new CustomError("Transaction is missing partner information", 400);
    }
    console.log('transactionEntity', transactionEntity);
    // 3. Buscamos o UserItem
    const userItem = await this.userItemRepository.find(new Uuid(data.benefit_uuid));
    if (!userItem) throw new CustomError("User item not found", 404);
    // 4. Validações de Negócio
    if (userItem.user_info_uuid.uuid !== data.appUserInfoID) throw new CustomError("User item is not from this user", 403);
    if (userItem.status === "inactive" || userItem.status === "blocked") throw new CustomError("User item is not active", 403);
    // 5. A verificação de saldo
    if (userItem.balance < transactionEntity.net_price) throw new CustomError("User item balance is not enough", 403);

    const partnerConfig = await this.partnerConfigRepository.findByPartnerId(transactionEntity.favored_business_info_uuid.uuid);
    if (!partnerConfig) throw new CustomError("Partner not found", 404);

    const isBenefitValid = partnerConfig.items_uuid.some((item) => item === userItem.item_uuid.uuid);
    if (!isBenefitValid) throw new CustomError("User item is not valid for this transaction", 403);

    // 6. Preparamos a entidade para o processamento
    transactionEntity.changeUserItemUuid(new Uuid(data.benefit_uuid));

    // 7. Direcionamos para o método correto do repositório
    if (userItem.item_category === "pre_pago") {
      try {
        const repoResult = await this.transactionOrderRepository.processSplitPrePaidPaymentTest(
          transactionEntity,
          new Uuid(data.appUserInfoID)
        );

        // ====================================================================
        // <<< PASSO 2: Enviar notificação de SUCESSO >>>
        // ====================================================================
        sseSendEvent(data.transactionId, 'paymentConfirmed', {
          status: 'success',
          message: 'Pagamento pré-pago confirmado!',
          amount: transactionEntity.net_price // Enviamos o valor em Reais
        });

        return { result: repoResult.success, finalBalance: repoResult.finalDebitedUserItemBalance / 100, cashback: repoResult.user_cashback_amount / 100 };
      } catch (err) {
        let errorMessage = 'Ocorreu um erro no pagamento.';
        if (err instanceof Error) {
          errorMessage = err.message;
        }

        sseSendEvent(data.transactionId, 'paymentFailed', {
          status: 'failed',
          message: errorMessage
        });
        throw err;
      }
    } else { // Pós-pago
      try {
        const repoResult = await this.transactionOrderRepository.processSplitPostPaidPayment(
          transactionEntity,
          new Uuid(data.appUserInfoID)
        );

        // Enviamos a mesma notificação de sucesso para o fluxo pós-pago
        sseSendEvent(data.transactionId, 'paymentConfirmed', {
          status: 'success',
          message: 'Pagamento pós-pago confirmado!',
          amount: transactionEntity.net_price
        });

        return { result: repoResult.success, finalBalance: repoResult.finalDebitedUserItemBalance / 100, cashback: repoResult.user_cashback_amount / 100 };
      } catch (err) {
        // Enviamos a mesma notificação de falha para o fluxo pós-pago
        let errorMessage = 'Ocorreu um erro no pagamento.';
        if (err instanceof Error) {
          errorMessage = err.message;
        }

        sseSendEvent(data.transactionId, 'paymentFailed', {
          status: 'failed',
          message: errorMessage
        });
        throw err;
      }
    }
  }
}