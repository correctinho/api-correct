import { CustomError } from "../../../../../../errors/custom.error";
import { IPixProvider } from "../../../../../../infra/providers/PixProvider/IPixProvider";
import { IAppUserItemRepository } from "../../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { ICompanyDataRepository } from "../../../../CompanyData/repositories/company-data.repository";
import { IBusinessOrderRepository } from "../../../repositories/business-order-repository";
import { InputCreateRechargeOrderDTO, OutputCreateRechargeOrderDTO } from "./dto/create-recharge-order.dto";

export class CreateRechargeOrderUsecase {
    constructor(
        private businessOrderRepository: IBusinessOrderRepository,
        private appUserItemRepository: IAppUserItemRepository,
        private businessInfoRepository: ICompanyDataRepository,
        private pixProvider: IPixProvider
    ) { }

    async execute(input: InputCreateRechargeOrderDTO): Promise<OutputCreateRechargeOrderDTO> {
        if (!input.items || input.items.length === 0) {
            throw new CustomError("O pedido deve conter pelo menos um item.", 400);
        }

        const userItemUuids = input.items.map(i => i.user_item_uuid);
        const currentDetails = await this.appUserItemRepository.findManyByUuids(userItemUuids);
        const detailsMap = new Map(currentDetails.map(item => [item.uuid.uuid, item]));

        let totalAmountCents = 0;

        const orderItemsToSave = input.items.map(item => {
            if (item.amount < 0) throw new CustomError("Não é permitido valor negativo.", 400);

            const details = detailsMap.get(item.user_item_uuid);
            if (!details) {
                throw new CustomError(`Colaborador (UserItem: ${item.user_item_uuid}) não encontrado ou inativo.`, 404);
            }

            const snapshot = {
                full_name: details.UserInfo?.full_name || "Nome não disponível",
                document: details.UserInfo?.document || "CPF não disponível",
                email: details.UserInfo?.email || null,
                group_name: details.BenefitGroups?.group_name || "Sem Grupo",
                original_group_value: details.BenefitGroups?.value || 0,
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

        const companyInfo = await this.businessInfoRepository.findById(input.business_info_uuid);
        if (!companyInfo) {
            throw new CustomError("Empresa não encontrada.", 404);
        }

        const pixKey = process.env.SICREDI_PIX_KEY;
        if (!pixKey) {
            throw new CustomError("Chave PIX da plataforma não configurada.", 500);
        }

        let providerTxId = undefined;
        let pixCopiaECola = undefined;

        if (input.payment_method !== 'TED') {
            const chargeResult = await this.pixProvider.createImmediateCharge({
                chave: pixKey,
                valor: (totalAmountCents / 100).toFixed(2),
                nome: companyInfo.corporate_reason,
                cnpj: companyInfo.document,
                solicitacaoPagador: 'Pagamento Pedido Syscorrect',
                expiracaoSegundos: 3600 // 1 hora
            });
            providerTxId = chargeResult.txid;
            pixCopiaECola = chargeResult.pixCopiaECola || pixKey;
        }

        const createdOrder = await this.businessOrderRepository.create(
            input.business_info_uuid,
            input.item_uuid,
            totalAmountCents,
            orderItemsToSave,
            providerTxId
        );

        return {
            order_uuid: createdOrder.uuid,
            status: createdOrder.status,
            total_amount: totalAmountCents / 100,
            pix_key: pixCopiaECola || ''
        };
    }
}
