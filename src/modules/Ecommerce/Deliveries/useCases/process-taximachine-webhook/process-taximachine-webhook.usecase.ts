import { prismaClient } from '../../../../../infra/databases/prisma.config';
import { DeliveryStatus, EcommerceOrderStatus } from '@prisma/client';

const taxiMachineStatusMap: Record<string, DeliveryStatus> = {
    'D': DeliveryStatus.DISTRIBUTING,
    'G': DeliveryStatus.WAITING_ACCEPTANCE,
    'P': DeliveryStatus.PENDING,
    'A': DeliveryStatus.ACCEPTED,
    'N': DeliveryStatus.NOT_ANSWERED,
    'F': DeliveryStatus.FINISHED,
    'C': DeliveryStatus.CANCELLED,
};

export class ProcessTaxiMachineWebhookUseCase {
    constructor() {}

    async execute(payload: any): Promise<void> {
        // 1. Captura: Extrai o ID da raiz do body
        const externalId = payload.id;
        const rawStatus = payload.status;

        if (!externalId) {
            console.error("Webhook recebido sem ID válido:", payload);
            return; // Evita falhar a request para a TaxiMachine
        }

        // 3. Mapeamento de Status
        const internalStatus = taxiMachineStatusMap[rawStatus] || DeliveryStatus.UNKNOWN;

        // 2. Busca no Banco de dados usando a tipagem forte nativa
        const delivery = await prismaClient.delivery.findUnique({
            where: { external_delivery_id: String(externalId) }
        });

        if (!delivery) {
            console.warn(`Entrega com external_delivery_id ${externalId} não encontrada no banco.`);
            return; // Retornamos para dar 200 OK na requisição e não prender a fila deles
        }

        // 4. Atualização do status da Entrega
        await prismaClient.delivery.update({
            where: { uuid: delivery.uuid },
            data: { status: internalStatus }
        });

        // 5. Transição para o E-commerce
        if (internalStatus === DeliveryStatus.FINISHED) {
            await prismaClient.ecommerceOrder.update({
                where: { uuid: delivery.ecommerce_order_uuid },
                data: { status: EcommerceOrderStatus.DELIVERED }
            });
            console.log(`Pedido E-commerce ${delivery.ecommerce_order_uuid} atualizado para DELIVERED.`);
        } else if (internalStatus === DeliveryStatus.CANCELLED) {
            await prismaClient.ecommerceOrder.update({
                where: { uuid: delivery.ecommerce_order_uuid },
                data: { status: EcommerceOrderStatus.CANCELED }
            });
            console.log(`Pedido E-commerce ${delivery.ecommerce_order_uuid} atualizado para CANCELED.`);
        }

        // Disparar eventos secundários adicionais (ex: Notificar Cliente via Socket) podem ser inseridos aqui
        console.log(`Entrega ${delivery.uuid} (TaxiMachine ID: ${externalId}) atualizada para o status: ${internalStatus}`);
    }
}
