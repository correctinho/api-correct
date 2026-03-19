import { CustomError } from "../../../../../../errors/custom.error";
import { IAppUserItemRepository } from "../../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { IBusinessOrderRepository } from "../../../repositories/business-order-repository";
import { InputCreateRechargeOrderDTO, OutputCreateRechargeOrderDTO } from "./dto/create-recharge-order.dto";

export class CreateRechargeOrderUsecase {
    constructor(
        private businessOrderRepository: IBusinessOrderRepository,
        private appUserItemRepository: IAppUserItemRepository // Injeção nova
    ) {}

    async execute(input: InputCreateRechargeOrderDTO): Promise<OutputCreateRechargeOrderDTO> {
        if (!input.items || input.items.length === 0) {
            throw new CustomError("O pedido deve conter pelo menos um item.", 400);
        }

        // 1. Busca os dados atuais de TODOS os colaboradores do pedido para criar o Snapshot
        const userItemUuids = input.items.map(i => i.user_item_uuid);
        const currentDetails = await this.appUserItemRepository.findManyByUuids(userItemUuids);

        // Mapa para acesso rápido (Performance O(1))
        const detailsMap = new Map(currentDetails.map(item => [item.uuid.uuid, item]));

        let totalAmountCents = 0;

        // 2. Monta os itens do pedido com o Snapshot preenchido
        const orderItemsToSave = input.items.map(item => {
            if (item.amount < 0) throw new CustomError("Não é permitido valor negativo.", 400);

            // Recupera os dados "vivos" do banco
            const details = detailsMap.get(item.user_item_uuid);

            if (!details) {
                throw new CustomError(`Colaborador (UserItem: ${item.user_item_uuid}) não encontrado ou inativo.`, 404);
            }

            // --- AQUI ESTÁ A CRIAÇÃO DO SNAPSHOT ---
            // Congelamos os dados deste momento exato
            const snapshot = {
                full_name: details.UserInfo?.full_name || "Nome não disponível",
                document: details.UserInfo?.document || "CPF não disponível",
                email: details.UserInfo?.email || null,
                group_name: details.BenefitGroups?.group_name || "Sem Grupo",
                original_group_value: details.BenefitGroups?.value || 0, // O valor padrão do grupo hoje
                admission_date: details.created_at 
            };

            const amountCents = Math.round(item.amount * 100);
            totalAmountCents += amountCents;

            return {
                user_item_uuid: item.user_item_uuid,
                amount_cents: amountCents,
                beneficiary_snapshot: snapshot 
            };
        });

        if (totalAmountCents === 0) throw new CustomError("O valor total do pedido não pode ser zero.", 400);

        // 3. Persiste no Banco
        const createdOrder = await this.businessOrderRepository.create(
            input.business_info_uuid,
            input.item_uuid,
            totalAmountCents,
            orderItemsToSave
        );

        // 4. Retorno (Chave PIX Mockada ou Variável de Ambiente)
        const pixKey = process.env.SICREDI_PIX_KEY

        return {
            order_uuid: createdOrder.uuid,
            status: createdOrder.status,
            total_amount: totalAmountCents / 100,
            pix_key: pixKey
        };
    }
}