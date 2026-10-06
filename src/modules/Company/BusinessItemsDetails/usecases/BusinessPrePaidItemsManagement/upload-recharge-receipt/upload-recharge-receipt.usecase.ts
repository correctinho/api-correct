import { CustomError } from "../../../../../../errors/custom.error";
import { IBusinessOrderRepository } from "../../../repositories/business-order-repository";
import { IStorage } from "../../../../../../infra/providers/storage/storage";
import { ISlackProvider } from "../../../../../../infra/providers/SlackProvider";
import { prismaClient } from "../../../../../../infra/databases/prisma.config";

export class UploadRechargeReceiptUseCase {
    constructor(
        private businessOrderRepository: IBusinessOrderRepository,
        private storageProvider: IStorage,
        private slackProvider: ISlackProvider
    ) {}

    async execute(
        business_info_uuid: string,
        order_uuid: string,
        file: Express.Multer.File
    ): Promise<void> {
        // 1. Busca o pedido e verifica se existe
        const order = await this.businessOrderRepository.findById(order_uuid);
        if (!order) {
            throw new CustomError("Pedido não encontrado.", 404);
        }

        // 2. Verifica se o pedido pertence à empresa
        if (order.business_info_uuid !== business_info_uuid) {
            throw new CustomError("Acesso não autorizado a este pedido.", 403);
        }

        // 3. Verifica o status do pedido
        if (order.status !== 'PENDING' && order.status !== 'REJECTED') {
            throw new CustomError("Não é possível anexar comprovante num pedido com status atual.", 400);
        }

        // 4. Faz o upload do arquivo
        const fileForUpload = {
            ...file,
            originalname: `receipt-${order_uuid}-${Date.now()}-${file.originalname}`
        } as any;

        const uploadResponse = await this.storageProvider.upload(
            fileForUpload,
            'receipts',
            true // true para bucket privado (documentos sensíveis)
        );

        if (uploadResponse.error || !uploadResponse.data?.url) {
            throw new CustomError("Falha ao fazer upload do comprovante.", 500);
        }

        // 5. Atualiza o banco de dados via Prisma direto (ou repository se existir updateUrl)
        await prismaClient.businessOrder.update({
            where: { uuid: order_uuid },
            data: { 
                payment_proof_url: uploadResponse.data.url,
                status: 'PENDING' // Se estava REJECTED, volta para PENDING aguardando nova análise
            }
        });

        // 6. Dispara notificação no Slack
        const companyName = order.Business?.fantasy_name || 'Empresa Desconhecida';
        await this.slackProvider.sendRechargeOrderAlert(companyName, order_uuid);
    }
}
