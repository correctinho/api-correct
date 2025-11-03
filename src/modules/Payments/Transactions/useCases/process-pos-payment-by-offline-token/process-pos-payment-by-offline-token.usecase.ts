// src/application/usecases/transactions/process-pos-transaction-with-offline-token.usecase.ts

import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { sseSendEvent } from "../../../../../infra/sse/sse.config";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository"; // Adicionado (se já não estiver em outro lugar)
import { IPartnerConfigRepository } from "../../../../Company/PartnerConfig/repositories/partner-config.repository";
import { OfflineTokenHistoryEventType, OfflineTokenStatus, TransactionType } from "@prisma/client"; // Importa enums
import { TransactionEntity } from "../../entities/transaction-order.entity";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { IOfflineTokenRepository } from "../../../OfflineTokens/repositories/offline-tokens.repository";
import { IOfflineTokenHistoryRepository } from "../../../OfflineTokens/repositories/offline-tokens-history.repository";
import { InputProcessPOSTransactionWithOfflineTokenDTO, OutputProcessPOSTransactionWithOfflineTokenDTO } from "./dto/process-pos-payment-by-offline-token.dto";
import { newDateF } from "../../../../../utils/date";

export class ProcessPOSTransactionWithOfflineTokenUsecase {
  constructor(
    private businessInfoRepository: ICompanyDataRepository,
    private transactionOrderRepository: ITransactionOrderRepository,
    private userItemRepository: IAppUserItemRepository,
    private partnerConfigRepository: IPartnerConfigRepository,
    private offlineTokenRepository: IOfflineTokenRepository,
  ) {}

  async execute(data: InputProcessPOSTransactionWithOfflineTokenDTO): Promise<OutputProcessPOSTransactionWithOfflineTokenDTO> {
    // 1. Validações Iniciais dos dados da transação
    if (!data.original_price) throw new CustomError("Original price is required", 400);
    if (data.discount_percentage === undefined || data.discount_percentage === null) throw new CustomError("Discount percentage is required", 400);
    if (!data.net_price) throw new CustomError("Net price is required", 400);
    if (data.original_price <= 0) throw new CustomError("Original price must be greater than zero", 400);
    if (data.net_price <= 0) throw new CustomError("Net price must be greater than zero", 400); // Net price também deve ser positivo
    if (!data.tokenCode) throw new CustomError("Offline token code is required", 400);
    if (data.tokenCode.length !== 6) throw new CustomError("Offline token code must be 6 characters long", 400); // Validação de tamanho
    // 2. Buscar e Validar o Offline Token (Usando o token_code de 6 caracteres, que é UNIQUE)
    const offlineToken = await this.offlineTokenRepository.findByTokenCode(data.tokenCode);
    if (!offlineToken) {
      throw new CustomError("Offline token not found for the provided code.", 404);
    }

    // Validação de Status do Token (apenas ACTIVE é permitido para uso)
    if (offlineToken.status !== OfflineTokenStatus.ACTIVE) {
      throw new CustomError(`Offline token is not active. Current status: ${offlineToken.status}.`, 403);
    }
    // Validação de Expiração
    if (offlineToken.expires_at && new Date(offlineToken.expires_at) < new Date()) {
      throw new CustomError("Offline token has expired.", 403);
    }

    // 3. Obter o UserItem UUID e UserInfo UUID do Token Offline
    if (!offlineToken.user_item_uuid) {
      throw new CustomError("Offline token is not linked to a user item.", 500); // Erro de configuração do token
    }
    const tokenUserItemUuid = offlineToken.user_item_uuid; // Prisma retorna string aqui se não for ValueObject
    const tokenUserInfoUuid = offlineToken.user_info_uuid; // Prisma retorna string aqui se não for ValueObject

    // 4. Validações de Negócio (Business, PartnerConfig)
    const businessInfo = await this.businessInfoRepository.findById(data.business_info_uuid);
    if (!businessInfo) throw new CustomError("Business not found", 400);
    if (businessInfo.status !== 'active') throw new CustomError("Business is not active", 403);
    if (businessInfo.business_type === 'empregador') throw new CustomError("Business type is not allowed for POS transactions", 403);

    const partnerConfig = await this.partnerConfigRepository.findByPartnerId(businessInfo.uuid);
    if (!partnerConfig) throw new CustomError("Partner configuration not found for this business.", 400);

    // 5. Criar a TransactionEntity (com o `user_item_uuid` e `used_offline_token_code`)
    const transactionDataForEntity = {
      ...data,
      transaction_type: TransactionType.POS_OFFLINE_PAYMENT, // Pode ser um novo enum TransactionType.POS_OFFLINE_PAYMENT
      user_item_uuid: tokenUserItemUuid, // UUID do UserItem do token
      favored_user_uuid: tokenUserInfoUuid, // O app-user favorecido é o dono do token
      favored_partner_user_uuid: data.partner_user_uuid,
      used_offline_token_code: data.tokenCode // Armazenando o código do token
    };

    const transactionEntity = TransactionEntity.create(transactionDataForEntity);

    // 6. Calcular taxas e setar IDs
    transactionEntity.calculateFeePercentage(partnerConfig.admin_tax, partnerConfig.marketing_tax);
    transactionEntity.calculateFee();
    transactionEntity.changeFavoredBusinessInfoUuid(new Uuid(data.business_info_uuid));
    transactionEntity.changePartnerUserUuid(new Uuid(data.partner_user_uuid));
    transactionEntity.changeDescription(data.description || "Transação POS com token offline.");
    transactionEntity.changeStatus('pending'); // Status inicial para esta transação combinada

    // 7. Validações de Negócio do UserItem (associado ao token)
    const userItem = await this.userItemRepository.find(tokenUserItemUuid);
    if (!userItem) throw new CustomError("User item associated with the token not found.", 404);
    if (userItem.user_info_uuid.uuid !== tokenUserInfoUuid.uuid) throw new CustomError("User item from token does not belong to the token's owner.", 403);
    if (userItem.status === "inactive" || userItem.status === "blocked") throw new CustomError("User item associated with token is not active.", 403);
    // 8. Verificação de Saldo/Limite do UserItem
    if (userItem.balance < transactionEntity.net_price) throw new CustomError("User item balance is not enough for this transaction.", 403);

    // Validação de elegibilidade do benefício para o parceiro
    const isBenefitValid = partnerConfig.items_uuid.some((item) => item === userItem.item_uuid.uuid);
    if (!isBenefitValid) throw new CustomError("User item associated with token is not valid for this transaction at this business.", 403);

    // 9. Processamento do Pagamento (Lógica pré-paga para tokens offline)
    if (userItem.item_category === "pre_pago") {
      try {
        // Chamada ao novo método do repositório que encapsula a transação atômica
        const repoResult = await this.transactionOrderRepository.processOfflineTokenPayment(
          transactionEntity,
          offlineToken, // Passa a entidade OfflineToken completa
          tokenUserInfoUuid, // O UUID do app-user dono do token
        );

        console.log(repoResult)
        return {
          transaction_uuid: transactionEntity.uuid.uuid,
          transaction_status: 'success', // Status final conforme sua entidade
          paid_at: transactionEntity.paid_at,
          offline_token_code: offlineToken.token_code,
          offline_token_status: OfflineTokenStatus.CONSUMED,
          finalBalance: repoResult.finalDebitedUserItemBalance / 100,
          cashback: repoResult.user_cashback_amount / 100,
          message: "Transaction created and paid successfully with offline token."
        };
      } catch (err: any) {
        let errorMessage = 'Ocorreu um erro no pagamento com token offline.';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        sseSendEvent(transactionEntity.uuid.uuid, 'paymentFailed', {
          status: 'failed',
          message: errorMessage
        });
        throw new CustomError(errorMessage, err.status || 500);
      }
    } else {
        // Regra de negócio: Tokens offline não são suportados para itens pós-pagos
        throw new CustomError("Offline tokens are currently only supported for pre-paid user items.", 400);
    }
  }
}