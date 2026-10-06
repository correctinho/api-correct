import { IBusinessOrderRepository } from "../../../repositories/business-order-repository";
import { InputListAllRechargeOrdersDTO, OutputListAllRechargeOrdersDTO } from "./dto/list-all-recharge-orders.dto";
import { IStorage } from "../../../../../../infra/providers/storage/storage";

export class ListAllRechargeOrdersUseCase {
    constructor(
        private businessOrderRepository: IBusinessOrderRepository,
        private storageProvider: IStorage
    ) {}

    async execute(input: InputListAllRechargeOrdersDTO): Promise<OutputListAllRechargeOrdersDTO> {
        const page = input.page && input.page > 0 ? input.page : 1;
        const limit = input.limit && input.limit > 0 ? input.limit : 20;
        
        const result = await this.businessOrderRepository.findAll({
            status: input.status,
            page,
            limit
        });

        const mappedData = await Promise.all(result.data.map(async (order) => {
            let presignedUrl = order.payment_proof_url;
            
            // Se o URL salvo não começa com http e existe getPresignedUrl no provedor, geramos o link temporário
            if (presignedUrl && !presignedUrl.startsWith('http') && this.storageProvider.getPresignedUrl) {
                try {
                    presignedUrl = await this.storageProvider.getPresignedUrl(presignedUrl);
                } catch (e) {
                    console.error("Falha ao gerar link do comprovante", e);
                }
            }

            return {
                uuid: order.uuid,
                business_info_uuid: order.business_info_uuid,
                business_fantasy_name: order.Business?.corporate_reason || order.Business?.fantasy_name || 'Desconhecido',
                total_amount: order.total_amount / 100,
                status: order.status,
                employees_count: order.OrderItems ? order.OrderItems.length : 0,
                created_at: order.created_at,
                payment_proof_url: presignedUrl
            };
        }));

        return {
            data: mappedData,
            count: result.count,
            page,
            limit
        };
    }
}
