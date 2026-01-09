import { CustomError } from "../../../../../../errors/custom.error";
import { IMailProvider } from "../../../../../../infra/providers/MailProvider/models/IMailProvider";
import { IBusinessOrderRepository } from "../../../repositories/business-order-repository";
import { InputApproveRechargeOrderDTO, OutputApproveRechargeOrderDTO } from "./dto/approve-recharge-order.dto";
import { getApprovedRechargeEmailTemplate } from "./email/notify-business.mail";
// Importe seu provedor de e-mail (ajuste o caminho)

export class ApproveRechargeOrderUsecase {
    constructor(
        private businessOrderRepository: IBusinessOrderRepository,
        private mailProvider: IMailProvider // Injeção do Provedor de Email
    ) {}

    async execute(input: InputApproveRechargeOrderDTO): Promise<OutputApproveRechargeOrderDTO> {
        // 1. Busca o Pedido (Agora tipado corretamente com OrderItems e Business)
        const order = await this.businessOrderRepository.findById(input.order_uuid);

        if (!order) {
            throw new CustomError("Pedido não encontrado.", 404);
        }

        // 2. Validações
        if (order.status === 'PAID') {
            throw new CustomError("Este pedido já foi processado e pago anteriormente.", 400);
        }
        if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
            throw new CustomError("Não é possível aprovar um pedido cancelado ou rejeitado.", 400);
        }

        // 3. Executa a Transação (Libera o dinheiro)
        await this.businessOrderRepository.approveOrderTransaction(input.order_uuid);

        // 4. Envia E-mail para o RH (Se a empresa tiver e-mail cadastrado)
        const senderEmail = process.env.MAIL_ACCOUNT_NOREPLY_USER;

        if (order.Business && order.Business.email && senderEmail) {
            
            const amountFormatted = new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
            }).format(order.total_amount / 100);

            const htmlBody = getApprovedRechargeEmailTemplate(
                order.Business.fantasy_name || 'Parceiro',
                amountFormatted,
                order.OrderItems.length,
                order.created_at
            );

            this.mailProvider.sendMail({
                to: order.Business.email,
                subject: "Recarga Aprovada! 🚀",
                body: htmlBody,
                from: {
                    name: "Equipe SysCorrect",
                    address: senderEmail 
                }
            }).catch(err => {
                // Loga o erro em background, mas não falha a requisição
                console.error(`[Email Background Error] Falha ao enviar para ${order.Business.email}:`, err);
            });
        }

        return {
            status: 'PAID',
            processed_items_count: order.OrderItems.length 
        };
    }
}