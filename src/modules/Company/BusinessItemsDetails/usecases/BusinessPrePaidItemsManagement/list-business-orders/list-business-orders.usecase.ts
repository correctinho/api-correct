import { IStorage } from "../../../../../../infra/providers/storage/storage";
import { IBusinessOrderRepository } from "../../../repositories/business-order-repository";
import { OutputListBusinessOrdersDTO } from "./dto/list-business-orders.dto";

export class ListBusinessOrdersUseCase {
    constructor(
        private businessOrderRepository: IBusinessOrderRepository,
        private storageProvider: IStorage
    ) { }

    async execute(businessInfoUuid: string, itemUuid: string): Promise<any> {
        const orders = await this.businessOrderRepository.findAllByBusinessAndItem(
            businessInfoUuid,
            itemUuid
        ) as any;

        const mappedOrders = await Promise.all(orders.map(async (order: any) => {
            let presignedUrl = order.payment_proof_url;
            if (presignedUrl) {
                try {
                    presignedUrl = await this.storageProvider.getPresignedUrl(presignedUrl);
                } catch (err) {
                    console.error("Erro ao gerar URL pre-assinada", err);
                }
            }

            return {
                uuid: order.uuid,
                total_amount: order.total_amount / 100,
                status: order.status,
                created_at: order.created_at,
                pix_key: order.status === 'PENDING' ? process.env.SICREDI_PIX_KEY : undefined,
                payment_method: order.provider_tx_id ? 'PIX' : 'TED',
                payment_proof_url: presignedUrl,
                employees_count: order._count?.OrderItems || 0
            };
        }));

        return { orders: mappedOrders };
    }
}
