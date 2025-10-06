import RepositoryInterface from '../../../../@shared/domain/repository/repository-interface';
import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo';
import { CalculateSplitPrePaidOutput } from '../../../../paymentSplit/prePaidSplit';
import { AppUserItemEntity } from '../../../AppUser/AppUserManagement/entities/app-user-item.entity';
import { BusinessAccountEntity } from '../../Accounts/entities/business-account.entity';
import { PartnerCreditEntity } from '../../Accounts/entities/partner-credit.entity';
import { TransactionEntity } from '../entities/transaction-order.entity';

export type ProcessPaymentByBusinessParams = {
    transaction: TransactionEntity;
    payerAccount: BusinessAccountEntity;
    payerCredits: PartnerCreditEntity[];
    sellerBusinessInfoId: string;
};

export type ProcessPaymentByBusinessResult = {
    amountPaidFromCredits: number;
    amountPaidFromLiquidBalance: number;
    payerFinalLiquidBalance: number;
};

export type ProcessAppUserPixCreditPaymentResult = {
    success: boolean;
    finalCreditedUserItemBalance: number;
};
export interface ITransactionOrderRepository extends RepositoryInterface<TransactionEntity> {
    savePOSTransaction(entity: TransactionEntity): Promise<TransactionEntity>;
    processSplitPrePaidPayment(
        transactionEntity: TransactionEntity,
        splitOutput: CalculateSplitPrePaidOutput,
        userInfoUuid: Uuid
    ): Promise<{
        success: boolean;
        finalDebitedUserItemBalance: number;
        user_cashback_amount: number;
    }>;
    findCorrectAccount(): Promise<any>;
    findBusinessAccountByBusinessInfoId(id: string): Promise<any>;
    generateTransactionReceiptDetails(transactionId: string): Promise<any>;
    processSplitPrePaidPaymentTest(
        transactionEntity: TransactionEntity,
        userInfoUuid: Uuid
    ): Promise<{
        success: boolean;
        finalDebitedUserItemBalance: number;
        user_cashback_amount: number;
    }>;
    processSplitPostPaidPayment(
        transactionEntity: TransactionEntity,
        userInfoUuid: Uuid // <<< Parâmetro adicionado
    ): Promise<{
        success: boolean;
        finalDebitedUserItemBalance: number;
        user_cashback_amount: number;
    }>;
    processPaymentByBusiness(
        params: ProcessPaymentByBusinessParams
    ): Promise<ProcessPaymentByBusinessResult>;
    createPendingCashIn(
        userId: Uuid,
        userItem: Uuid,
        amountInCents: number
    ): Promise<TransactionEntity>;
    updateTxId(transactionId: Uuid, txid: string): Promise<void>;
    findByProviderTxId(providerTxId: string): Promise<TransactionEntity | null>;
    processAppUserPixCreditPayment(
        transactionEntity: TransactionEntity,
        amountReceivedInCents: number,
    ): Promise<ProcessAppUserPixCreditPaymentResult>;}
