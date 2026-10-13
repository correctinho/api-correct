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
        const startDateIso = input.start_date.includes('T') ? input.start_date : new Date(`${input.start_date}T00:00:00.000Z`).toISOString();
        const endDateIso = input.end_date.includes('T') ? input.end_date : new Date(`${input.end_date}T23:59:59.999Z`).toISOString();

        // 3. Chama o repositório de transações passando as chaves reais
        const transactions = await this.transactionOrderRepository.findApprovedByItemAndPeriod(
            businessInfoUuid,
            itemUuid,
            startDateIso,
            endDateIso
        );

        // 4. Agrupa e soma em centavos e converte para reais ao final
        const consumptionMap = new Map<string, {
            name: string;
            document: string;
            company_internal_code: string | null;
            total_used_cents: number;
        }>();
        let totalCycleUsedCents = 0;

        for (const tx of transactions) {
            const document = tx.UserItem?.UserInfo?.document;
            const fullName = tx.UserItem?.UserInfo?.full_name;
            const internalCode = tx.UserItem?.UserInfo?.Employee?.[0]?.company_internal_code ?? null;
            const txCents = tx.net_price || 0;

            // Se a transação não tem um usuário vinculado, ignoramos
            if (!document) continue;

            if (!consumptionMap.has(document)) {
                consumptionMap.set(document, {
                    name: fullName || 'Desconhecido',
                    document: document,
                    company_internal_code: internalCode,
                    total_used_cents: 0
                });
            }

            const collaborator = consumptionMap.get(document)!;
            if (!collaborator.company_internal_code && internalCode) {
                collaborator.company_internal_code = internalCode;
            }
            collaborator.total_used_cents += txCents;
            totalCycleUsedCents += txCents;
        }

        // Converte de centavos para reais (ex: 2500 centavos -> 25.00 reais)
        const collaborators: CollaboratorConsumption[] = Array.from(consumptionMap.values()).map(c => ({
            name: c.name,
            document: c.document,
            company_internal_code: c.company_internal_code,
            internal_company_code: c.company_internal_code,
            total_used: Number((c.total_used_cents / 100).toFixed(2))
        }));

        return {
            collaborators,
            total_cycle_used: Number((totalCycleUsedCents / 100).toFixed(2))
        };
    }
}
