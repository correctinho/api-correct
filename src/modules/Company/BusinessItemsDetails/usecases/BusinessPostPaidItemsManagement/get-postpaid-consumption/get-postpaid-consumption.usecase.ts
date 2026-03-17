import { CustomError } from "../../../../../../errors/custom.error";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { InputGetPostpaidConsumptionDTO, OutputGetPostpaidConsumptionDTO, CollaboratorConsumption } from "./dto/get-postpaid-consumption.dto";
import { ITransactionOrderRepository } from "../../../../../Payments/Transactions/repositories/transaction-order.repository";
import { IBusinessItemDetailsRepository } from "../../../repositories/business-item-details.repository";

export class GetPostpaidConsumptionUsecase {

    // Injetamos ambos os repositórios pelo construtor
    constructor(
        private transactionOrderRepository: ITransactionOrderRepository,
        private businessItemDetailsRepository: IBusinessItemDetailsRepository
    ) {}

    async execute(input: InputGetPostpaidConsumptionDTO): Promise<OutputGetPostpaidConsumptionDTO> {

        // 1. Busca os detalhes do benefício através do Repositório usando o ValueObject Uuid
        const employerDetailsUuid = new Uuid(input.employer_item_details_uuid);

        // Usamos o método da interface que retorna o DTO/Entidade com os dados completos
        const employerDetails = await this.businessItemDetailsRepository.findByIdWithItems(employerDetailsUuid);

        if (!employerDetails) {
            throw new CustomError("Detalhes do benefício não encontrados.", 404);
        }

        // Recuperamos as chaves necessárias
        const businessInfoUuid = employerDetails.business_info_uuid;
        const itemUuid = employerDetails.item_uuid;

        if (!businessInfoUuid || !itemUuid) {
            throw new CustomError("Dados incompletos no cadastro do benefício.", 400);
        }

        if(businessInfoUuid !== input.business_info_uuid) {
            throw new CustomError("Acesso negado: o benefício não pertence a esta empresa.", 403);
        }

        // 2. Converte as datas para String ISO 8601 (para o Prisma conseguir filtrar no banco de dados)
        const startDateIso = new Date(`${input.start_date}T00:00:00.000Z`).toISOString();
        const endDateIso = new Date(`${input.end_date}T23:59:59.999Z`).toISOString();

        // 3. Chama o repositório de transações passando as chaves reais
        const transactions = await this.transactionOrderRepository.findApprovedByItemAndPeriod(
            businessInfoUuid,
            itemUuid,
            startDateIso,
            endDateIso
        );

        // 4. Agrupa e soma
        const consumptionMap = new Map<string, CollaboratorConsumption>();
        let totalCycleUsed = 0;

        for (const tx of transactions) {
            const document = tx.UserItem?.UserInfo?.document;
            const fullName = tx.UserItem?.UserInfo?.full_name;
            const txAmount = tx.net_price;

            // Se a transação não tem um usuário vinculado, ignoramos
            if (!document) continue;

            if (!consumptionMap.has(document)) {
                consumptionMap.set(document, {
                    name: fullName || 'Desconhecido',
                    document: document,
                    total_used: 0
                });
            }

            const collaborator = consumptionMap.get(document)!;
            collaborator.total_used += txAmount;
            totalCycleUsed += txAmount;
        }

        return {
            collaborators: Array.from(consumptionMap.values()),
            total_cycle_used: totalCycleUsed
        };
    }
}
