import { IBusinessOrderRepository } from "../../../repositories/business-order-repository";
import { OutputListBusinessOrdersDTO } from "./dto/list-business-orders.dto";


export class ListBusinessOrdersUseCase {
    constructor(
        private businessOrderRepository: IBusinessOrderRepository
    ) {}

    async execute(businessInfoUuid: string, itemUuid: string): Promise<OutputListBusinessOrdersDTO> {
        const orders = await this.businessOrderRepository.findAllByBusinessAndItem(
            businessInfoUuid,
            itemUuid
        );

        return {
            orders: orders.map(order => ({
                uuid: order.uuid,
                // Converte centavos para Reais
                total_amount: order.total_amount / 100, 
                status: order.status,
                created_at: order.created_at,
                pix_key: order.status === 'PENDING' ? process.env.SICREDI_PIX_KEY : undefined 
            }))
        };
    }
}