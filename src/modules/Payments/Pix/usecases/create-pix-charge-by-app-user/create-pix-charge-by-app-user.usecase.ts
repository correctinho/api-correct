import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IMailProvider } from "../../../../../infra/providers/MailProvider/models/IMailProvider";
import { IPixProvider } from "../../../../../infra/providers/PixProvider/IPixProvider";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { ITransactionOrderRepository } from "../../../Transactions/repositories/transaction-order.repository";
import { InputCreatePixChargeDTO, OutputCreatePixChargeDTO } from "./dto/create-pix-charge.dto";
import { getPixChargeEmailTemplate } from "./email/pay-pix-notification.template";

export class CreatePixChargeByAppUserUsecase {
    constructor(
        private readonly pixProvider: IPixProvider,
        private readonly transactionRepository: ITransactionOrderRepository,
        private readonly userInfoRepository: IAppUserInfoRepository,
        private readonly userItemRepository: IAppUserItemRepository,
        private readonly mailProvider: IMailProvider
    ) { }

    async execute(input: InputCreatePixChargeDTO): Promise<OutputCreatePixChargeDTO> {
        // 1. Validação de Entrada
        if (!input.userId || !input.userItemUuid || !input.amountInReais || input.amountInReais <= 0) {
            throw new CustomError("User ID, ID do cartão destino e um valor positivo são necessários.", 400);
        }

        // 2. Busca dos dados do usuário (pagador/devedor)
        const userInfo = await this.userInfoRepository.find(new Uuid(input.userId));
        if (!userInfo) {
            throw new CustomError("Usuário não encontrado.", 404);
        }
        
        // 3. Busca o cartão específico que o usuário selecionou
        const targetUserItemUuid = new Uuid(input.userItemUuid);
        const userItem = await this.userItemRepository.find(targetUserItemUuid);
        if (!userItem) throw new CustomError("Conta destino não encontrada.", 400);

        // 3.1 SEGURANÇA: Verifica se o cartão pertence mesmo ao usuário que está pedindo
        if (userItem.user_info_uuid.uuid !== userInfo.uuid.uuid) {
             throw new CustomError("Este cartão não pertence ao usuário solicitado.", 403);
        }

        // 3.2 REGRA DE NEGÓCIO: Verifica o tipo do item
        if (userItem.item_type === 'gratuito') {
            throw new CustomError(
                `Não é permitido adicionar saldo via PIX para cartões do tipo '${userItem.item_category}'. Por favor, selecione outro cartão.`,
                422 // Unprocessable Entity - A requisição é válida, mas a regra de negócio impede
            );
        }

        // 4. Criação da nossa transação interna com status 'pending'
        const amountInCents = Math.round(input.amountInReais * 100);
        const pendingTransaction = await this.transactionRepository.createPendingCashIn(
            new Uuid(input.userId),
            userItem.uuid,
            amountInCents
        );

        // 5. Prepara os dados para o Provedor PIX
        const chargeData = {
            cpf: userInfo.document,
            nome: userInfo.full_name,
            valor: input.amountInReais.toFixed(2),
            chave: process.env.SICREDI_PIX_KEY!,
        };

        // 6. Chama o Provedor (Sicredi, neste caso) para criar a cobrança PIX
        const pixChargeResult = await this.pixProvider.createImmediateCharge(chargeData);

        // 7. Atualiza nossa transação interna com o txid do provedor
        await this.transactionRepository.updateTxId(pendingTransaction.uuid, pixChargeResult.txid);

        // Notifica por email
        try {
            const formattedAmount = input.amountInReais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            const emailHtml = getPixChargeEmailTemplate({
                userName: userInfo.full_name,
                amountFormatted: formattedAmount,
                pixCopyPaste: pixChargeResult.pixCopiaECola
            });

            // Não usamos await aqui para não travar a resposta ao frontend caso o envio de email demore.
            // O ideal em produção é usar uma fila (background job), mas para agora o "fire and forget" funciona.
            this.mailProvider.sendMail({
                to: userInfo.email,
                from: {
                    name: 'Correct',
                    address: 'nao-responda@correct.com.br',
                },
                subject: 'Seu PIX para depósito foi gerado!',
                body: emailHtml,
            }).catch(err => {
                // Logamos o erro de envio de email, mas não quebramos o fluxo principal
                console.error(`[CreatePixCharge] Falha ao enviar e-mail para ${userInfo.email}:`, err);
            });

        } catch (emailError) {
             // Captura erros síncronos na montagem do template, se houver
             console.error(`[CreatePixCharge] Erro ao preparar e-mail:`, emailError);
        }

        // 8. Retorna os dados para o frontend
        return {
            transactionId: pendingTransaction.uuid.uuid,
            pixCopyPaste: pixChargeResult.pixCopiaECola,
        };
    }
}