import { ItemType } from "@prisma/client";
import { IAppUserItemRepository } from "../../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { ITransactionOrderRepository } from "../../../repositories/transaction-order.repository";
import { InputTransferBetweenOwnCardsDTO } from "./dto/transfer-between-own-cards.dto";
import { CustomError } from "../../../../../../errors/custom.error";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";

export class TransferBetweenOwnCardsUsecase {
    private readonly FORBIDDEN_TYPE = ItemType.gratuito
    private readonly hubItemUuid: string;

    constructor(
        private readonly userItemRepository: IAppUserItemRepository,
        private readonly transactionRepository: ITransactionOrderRepository
    ) {
        // --- MUDANÇA 1: Carregar e validar a variável de ambiente no construtor ---
        const envHubUuid = process.env.CORRECT_ITEM_UUID;
        if (!envHubUuid) {
            // Isso é um erro de configuração do servidor, deve parar a aplicação ou falhar o request visivelmente no log.
            throw new Error("CRITICAL CONFIG ERROR: A variável de ambiente CORRECT_ITEM_UUID não está definida.");
        }
        this.hubItemUuid = envHubUuid;
    }

    async execute(input: InputTransferBetweenOwnCardsDTO): Promise<void> {
        // 1. Validações Básicas de Entrada
        if (input.amountInCents <= 0) {
             throw new CustomError("O valor da transferência deve ser positivo.", 400);
        }
        if (input.originUserItemUuid === input.destinationUserItemUuid) {
             throw new CustomError("Origem e destino não podem ser a mesma conta.", 400);
        }

        // 2. Buscar os Itens de Origem e Destino
        const originUserItem = await this.userItemRepository.find(new Uuid(input.originUserItemUuid));
        const destinationUserItem = await this.userItemRepository.find(new Uuid(input.destinationUserItemUuid));

        // 3. Validação de Existência
        if (!originUserItem) throw new CustomError("Conta de origem não encontrada.", 404);
        if (!destinationUserItem) throw new CustomError("Conta de destino não encontrada.", 404);


        // ==================================================================
        // INÍCIO DAS REGRAS DE NEGÓCIO CRÍTICAS (TEI INTRA-USUÁRIO)
        // ==================================================================

        // REGRA 1: Propriedade (Ambos devem pertencer ao usuário logado)
        if (originUserItem.user_info_uuid.uuid !== input.userId || destinationUserItem.user_info_uuid.uuid !== input.userId) {
            console.error(`[TEI Intra] Tentativa de transferência entre contas de donos diferentes. User: ${input.userId}, OriginOwner: ${originUserItem.user_info_uuid.uuid}, DestOwner: ${destinationUserItem.user_info_uuid.uuid}`);
            throw new CustomError("Operação não permitida. As contas não pertencem ao mesmo usuário.", 403);
        }

        // Acessando dados do Item pai
        // Precisamos dos nomes apenas para a descrição da transação no final
        const originName = originUserItem.item_name;
        const destName = destinationUserItem.item_name;
        
        // Acessando os tipos para validação
        const originType = originUserItem.item_type // ou item_type
        const destType = destinationUserItem.item_type // ou item_type

        // REGRA 2: Tipos Proibidos (Nenhum pode ser 'gratuito')
        if (originType === this.FORBIDDEN_TYPE || destType === this.FORBIDDEN_TYPE) {
             throw new CustomError(`Transações não são permitidas para itens do tipo '${this.FORBIDDEN_TYPE}'.`, 422);
        }

        const isOriginHub = originUserItem.item_uuid.uuid === this.hubItemUuid;
        const isDestinationHub = destinationUserItem.item_uuid.uuid === this.hubItemUuid;

        // Se NEM a origem E NEM o destino forem o Hub, bloqueia.
        if (!isOriginHub && !isDestinationHub) {
            throw new CustomError(
                "Transferência direta entre benefícios não permitida. Utilize sua conta Correct como intermediária.",
                422
            );
        }

        // ==================================================================
        // FIM DAS REGRAS DE NEGÓCIO
        // ==================================================================


        // 4. Executar a Transferência Atômica
        try {
            await this.transactionRepository.executeTeiTransfer({
                payerUserItemUuid: originUserItem.uuid.uuid,
                payeeUserItemUuid: destinationUserItem.uuid.uuid,
                amount: input.amountInCents,
                transactionData: {
                    payerUserInfoUuid: input.userId,
                    payeeUserInfoUuid: input.userId,
                    // Usamos os nomes aqui apenas para ficar bonito no extrato
                    description: `Transferência interna: ${originName} para ${destName}`
                }
            });

        } catch (error) {
            if (error instanceof CustomError) throw error;
            console.error("[TEI Intra-User Error]", error);
            throw new Error("Erro inesperado ao processar a transferência interna.");
        }
    }
}