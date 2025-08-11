
import { custom } from "zod";
import { ITransactionOrderRepository } from "../../../../Transactions/repositories/transaction-order.repository";
import { IPartnerCreditRepository } from "../../../repositories/partner-credit.repository";
import { OutputFindPartnerCreditsDTO } from "../dto/business-account.dto";
import { CustomError } from "../../../../../../errors/custom.error";

export class GetBusinessCreditsUsecase {
    constructor(
        private readonly partnerCreditRepository: IPartnerCreditRepository,
        private readonly transactionOrderRepository: ITransactionOrderRepository
    ) { }

    async execute(businessId: string): Promise<OutputFindPartnerCreditsDTO> {
        const findBusinessAccount = await this.transactionOrderRepository.findBusinessAccountByBusinessInfoId(businessId);
        if (!findBusinessAccount) throw new CustomError("Business account not found", 404);
        // O repositório agora retorna um array de PartnerCreditEntity
        const creditsEntities = await this.partnerCreditRepository.findAllByBusinessAccount(findBusinessAccount.uuid);
        // O use case usa os getters da entidade para montar o DTO de saída.
        // Note como a lógica fica mais limpa e expressiva.
        return creditsEntities.map(credit => {
            return {
                uuid: credit.uuid.uuid,
                balance: credit.balance, 
                status: credit.status,
                availability_date: credit.availability_date,
                original_transaction_uuid: credit.original_transaction_uuid.uuid,
                created_at: credit.created_at
            };
        });
    }
}