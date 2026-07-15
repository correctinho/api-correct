import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { CustomError } from '../../../../../errors/custom.error';
import { ITransactionOrderRepository } from '../../../Transactions/repositories/transaction-order.repository';
import { BusinessStatus, CorrectAccountEventType, TransactionStatus, TransactionType } from '@prisma/client';
import { newDateF } from '../../../../../utils/date';
import { TransactionEntity } from '../../../Transactions/entities/transaction-order.entity';
import { ISubscriptionRepository } from '../../../SubscriptionsPlans/repositories/subscription.repository';
import { IAppUserItemRepository } from '../../../../AppUser/AppUserManagement/repositories/app-user-item-repository';
import { ICompanyDataRepository } from '../../../../Company/CompanyData/repositories/company-data.repository';
import { IMailProvider } from '../../../../../infra/providers/MailProvider/models/IMailProvider';

// Tipagem do payload do Sicredi
export interface SicrediPix {
    endToEndId: string;
    txid: string;
    valor: string;
    horario: string;
    pagador?: {
        nome: string;
        cpf?: string;
        cnpj?: string;
    };
    infoPagador?: string;
}

interface SicrediPixWebhookPayload {
    pix: SicrediPix[];
}

export class ProcessPixWebhookUsecase {
    constructor(
        private readonly transactionRepository: ITransactionOrderRepository,
        private readonly subscriptionRepository: ISubscriptionRepository,
        private readonly userItemRepository: IAppUserItemRepository,
        private readonly businessRepository: ICompanyDataRepository,
        private readonly mailProvider: IMailProvider
    ) { }

    public async execute(payload: SicrediPixWebhookPayload): Promise<void> {
        console.log('\n✅✅✅ WEBHOOK DO SICREDI RECEBIDO! ✅✅✅');
        // console.log('Payload recebido:', JSON.stringify(payload, null, 2));

        //Resposta da API SICREDI
        //         "pix": [
        //     {
        //       "endToEndId": "E03042597202511241449436k9xOoGHb",
        //       "txid": "7594d8828ac9487c94e4a2d40de6856c",
        //       "valor": "0.01",
        //       "chave": "62960b52-9f19-4c5e-8ce3-b9528fa848c4",
        //       "componentesValor": {
        //         "original": {
        //           "valor": "0.01"
        //         }
        //       },
        //       "horario": "2025-11-24T14:50:03.988Z"
        //     }
        //   ]
        // if (!payload?.pix?.length) {
        //     console.warn(
        //         "AVISO: Webhook recebido com formato inválido ou sem a chave 'pix'."
        //     );
        //     throw new CustomError('Webhook payload inválido.', 400);
        // }

        // // Para lidar com múltiplos PIX no mesmo webhook (se aplicável) e reportar erros consolidados
        // // ou falhar o processamento total se qualquer item PIX tiver um erro crítico
        const processingFailures: string[] = []; // Para coletar mensagens de erro que devem levar a um 4xx/5xx

        for (const pixPayment of payload.pix) {
            const providerTxId = pixPayment.txid;
            if (!providerTxId) {
                const errorMessage = 'ERRO: Item do webhook sem txid.';
                processingFailures.push(`[unknown_txid] ${errorMessage}`);
                continue; // Passa para o próximo item do webhook, mas registra a falha
            }

            try {
                // Passo 1: Encontrar a transação pelo providerTxId (txid)
                const transaction =
                    await this.transactionRepository.findByProviderTxId(
                        providerTxId
                    );
                if (!transaction) {
                    const errorMessage = `ERRO: Transação interna não encontrada para o txid: ${providerTxId}. O Sicredi pode estar enviando um PIX para uma cobrança desconhecida.`;
                    console.error(errorMessage);
                    processingFailures.push(
                        `[${providerTxId}] ${errorMessage}`
                    );
                    continue; // Registra a falha e passa para o próximo item
                }

                // Passo 2: Validação de idempotência (comum a todos os tipos de cash-in)
                if (transaction.status !== TransactionStatus.pending) {
                    console.warn(
                        `AVISO: Transação ${transaction.uuid.uuid} (txid: ${providerTxId}) já processada (status: ${transaction.status}). Ignorando re-processamento.`
                    );
                    continue; // Esta é uma condição "já OK", não falha.
                }

                // Passo 3: Roteamento com base no tipo de transação
                switch (transaction.transaction_type) {
                    case TransactionType.CASH_IN_PIX_USER:
                        await this.processCashInUser(transaction, pixPayment);
                        break;

                    case TransactionType.CASH_IN_PIX_PARTNER:
                        await this.processCashInPartner(
                            transaction,
                            pixPayment
                        );
                        break;

                    case 'SUBSCRIPTION_PAYMENT' as TransactionType: // Casting se necessário
                        // Ou se você importou o enum: case TransactionType.SUBSCRIPTION_PAYMENT:
                        await this.processSubscriptionPayment(
                            transaction,
                            pixPayment
                        );
                        break;
                    case TransactionType.ONBOARDING_PIX:
                        await this.processOnboardingPix(
                            transaction,
                            pixPayment
                        );
                        break;

                    default:
                        const errorMessage = `AVISO: Tipo de transação PIX '${transaction.transaction_type}' não suportado ou configurado para o txid ${providerTxId}.`;
                        console.warn(errorMessage);
                        processingFailures.push(
                            `[${providerTxId}] ${errorMessage}`
                        );
                        // Este é um caso onde o sistema não sabe como lidar, então é uma falha.
                        break; // Permite que o loop continue, mas o erro será lançado no final
                }
            } catch (error) {
                // Captura qualquer CustomError lançado pelos métodos de processamento específicos
                const errorMessage = `ERRO ao processar PIX para txid ${providerTxId}: ${error instanceof Error ? error.message : 'Erro desconhecido.'}`;
                console.error(errorMessage, error);
                processingFailures.push(`[${providerTxId}] ${errorMessage}`);
                // Não relançamos aqui para que o loop possa continuar tentando processar outros PIX no mesmo webhook.
            }
        }

        // Passo 4: Decisão final da resposta HTTP para o Sicredi
        if (processingFailures.length > 0) {
            // Se houver qualquer falha que não seja por idempotência, lançamos um CustomError.
            // O controlador irá capturá-lo e responder com um status HTTP de erro (4xx/5xx).
            const consolidatedErrorMessage = `Falhas no processamento do webhook PIX: ${processingFailures.join(' | ')}`;
            // Pode ser um 400 para erros de validação ou 500 para erros internos mais graves
            throw new CustomError(consolidatedErrorMessage, 400); // Ou 500, dependendo da sua política
        }

        // Se chegarmos aqui, significa que todos os itens foram processados com sucesso ou já estavam em estado final.
        // O controlador responderá 200 OK.
    }

    /**
     * Processa um cash-in PIX destinado a um AppUser, creditando o saldo em seu UserItem.
     */
    private async processCashInUser(
        transaction: TransactionEntity,
        pixPayment: SicrediPix
    ): Promise<void> {
        console.log(
            `Iniciando processamento de CASH_IN_PIX_USER para a transação ${transaction.uuid.uuid}`
        );
        const EPSILON = 0.001;
        // Validação de valor
        const receivedAmountInCents = parseFloat(pixPayment.valor) * 100;
        // if (Math.abs(transaction.net_price - receivedAmountInCents) > EPSILON) {
        //     console.log("CAIU AQUI *********")
        //     const errorMessage = `ERRO DE VALOR para CASH_IN_PIX_USER (tx: ${transaction.uuid.uuid}). Esperado: ${transaction.net_price} (reais), Recebido: ${receivedAmountInCents} (reais). Diferença maior que ${EPSILON}.`;
        //     console.error(errorMessage);
        //     throw new CustomError(errorMessage, 400);
        // }
        // Atualiza a entidade de domínio com os detalhes do pagamento
        const paidAtString = newDateF(new Date(pixPayment.horario));
        transaction.setPixPaymentDetails(pixPayment.endToEndId, paidAtString);

        // Delega para o repositório a lógica transacional de crédito e persistência
        const result =
            await this.transactionRepository.processAppUserPixCreditPayment(
                transaction,
                receivedAmountInCents
            );

        if (result.success) {
            console.log(
                `✅ SUCESSO: Crédito PIX para AppUser processado para a transação ${transaction.uuid.uuid}.`
            );
        } else {
            // Se o repositório retornar 'success: false' sem lançar um erro
            const errorMessage = `❌ FALHA: Repositório falhou ao processar crédito PIX para AppUser (tx: ${transaction.uuid.uuid}).`;
            console.error(errorMessage);
            throw new CustomError(errorMessage, 500); // Indicar um erro interno
        }
    }

    /**
     * Processa um cash-in PIX destinado a um Partner, creditando o saldo em sua BusinessAccount.
     * (Placeholder para implementação futura)
     */
    private async processCashInPartner(
        transaction: TransactionEntity,
        pixPayment: SicrediPix
    ): Promise<void> {
        console.log(
            `AVISO: Processamento para CASH_IN_PIX_PARTNER (transação ${transaction.uuid.uuid}) ainda não implementado. Ignorando.`
        );
        // Aqui entraria a lógica futura:
        // 1. Validar valor (similar ao processCashInUser)
        // 2. Chamar um novo método no repositório: `this.transactionRepository.processPartnerPixCreditPayment(...)`.
        // 3. Este novo método faria o crédito na `BusinessAccount` ou similar do parceiro
        //    e registraria o histórico correspondente.

        // POR ENQUANTO, como é um placeholder, se ele for chamado, indica um problema.
        // Podemos tratar isso como uma falha para que o Sicredi reenvie e tenhamos chance de implementar.
        const errorMessage = `ERRO: Processamento para CASH_IN_PIX_PARTNER (tx: ${transaction.uuid.uuid}) não implementado.`;
        console.error(errorMessage);
        throw new CustomError(errorMessage, 501); // 501 Not Implemented
    }

    private async processSubscriptionPayment(
        transaction: TransactionEntity,
        pixPayment: SicrediPix
    ): Promise<void> {
        console.log(
            `Iniciando processamento de SUBSCRIPTION_PAYMENT para a transação ${transaction.uuid.uuid}`
        );

        // 1. Validação de Valor (Crucial para evitar fraudes)
        const receivedAmountInCents = Math.round(
            parseFloat(pixPayment.valor) * 100
        );
        const expectedAmountInCents = Math.round(transaction.net_price * 100); // Já está em centavos na entidade
        // Permite uma pequena margem de erro se necessário, mas para PIX exato, deve ser igual.
        if (receivedAmountInCents !== expectedAmountInCents) {
            const errorMessage = `ERRO DE VALOR para SUBSCRIPTION_PAYMENT (tx: ${transaction.uuid.uuid}). Esperado: ${expectedAmountInCents} centavos, Recebido: ${receivedAmountInCents} centavos.`;
            console.error(errorMessage);
            // Lança erro para que o webhook falhe e o banco tente novamente (se for erro de arredondamento do banco)
            // ou para marcar como fraude.
            throw new CustomError(errorMessage, 400);
        }
        // 2. Validar se a transação tem os vínculos necessários
        if (!transaction.subscription_uuid || !transaction.user_item_uuid) {
            const errorMessage = `ERRO: Transação de assinatura ${transaction.uuid.uuid} sem subscription_uuid ou user_item_uuid vinculado.`;
            console.error(errorMessage);
            throw new CustomError(errorMessage, 500); // Erro interno grave de inconsistência
        }

        // 3. Buscar as entidades relacionadas
        const subscription = await this.subscriptionRepository.find(
            transaction.subscription_uuid
        );
        if (!subscription) {
            throw new CustomError(
                `Assinatura ${transaction.subscription_uuid.uuid} não encontrada.`,
                404
            );
        }

        const userItem = await this.userItemRepository.find(
            transaction.user_item_uuid
        );
        if (!userItem) {
            throw new CustomError(
                `UserItem ${transaction.user_item_uuid.uuid} não encontrado.`,
                404
            );
        }

        // 4. Atualizar a Transação para SUCCESS
        const paidAtString = newDateF(new Date(pixPayment.horario));
        transaction.setPixPaymentDetails(pixPayment.endToEndId, paidAtString);

        await this.transactionRepository.upsert(transaction);
        console.log(`Transação ${transaction.uuid.uuid} marcada como SUCCESS.`);

        // 5. Ativar a Assinatura
        subscription.markAsPaidAndActivate('MONTHLY')
        await this.subscriptionRepository.upsert(subscription); // Repositório deve ter save/update
        console.log(`Assinatura ${subscription.uuid.uuid} ATIVADA.`);

        // 6. Ativar o UserItem (Liberar o benefício)
        userItem.activateStatus(); // Método na entidade AppUserItemEntity

        await this.userItemRepository.upsert(userItem); // Repositório deve ter save/update
        console.log(
            `UserItem ${userItem.uuid.uuid} ATIVADO e liberado para uso.`
        );

        console.log(
            `✅ SUCESSO: Pagamento de assinatura processado e serviço liberado.`
        );
    }

    /**
     * Processa o pagamento da Taxa de Adesão (Onboarding) de um novo Lojista.
     * Atualiza a transação para SUCCESS e altera o status do BusinessInfo para pending_approval.
     */
    private async processOnboardingPix(
        transaction: TransactionEntity,
        pixPayment: SicrediPix
    ): Promise<void> {
        console.log(`Iniciando processamento de ONBOARDING_PIX para a transação ${transaction.uuid.uuid}`);

        const receivedAmountInCents = Math.round(parseFloat(pixPayment.valor) * 100);
        const expectedAmountInCents = Math.round(transaction.net_price);

        if (receivedAmountInCents !== expectedAmountInCents) {
            throw new CustomError(`ERRO DE VALOR para ONBOARDING_PIX. Esperado: ${expectedAmountInCents}, Recebido: ${receivedAmountInCents}`, 400);
        }

        if (!transaction.payer_business_info_uuid) {
            throw new CustomError(`ERRO: Transação sem payer_business_info_uuid.`, 500);
        }

        const paidAtString = newDateF(new Date(pixPayment.horario));
        transaction.setPixPaymentDetails(pixPayment.endToEndId, paidAtString);
        await this.transactionRepository.upsert(transaction);

        // ==========================================
        // Registro da Receita 
        // ==========================================
        await this.transactionRepository.registerPlatformRevenue(
            expectedAmountInCents,
            CorrectAccountEventType.ONBOARDING_REVENUE,
            transaction.uuid.uuid
        );
        console.log(`Receita registrada na Correct Account para a transação ${transaction.uuid.uuid}`);

        // Atualizar status da empresa
        await this.businessRepository.updateStatus(
            transaction.payer_business_info_uuid.uuid,
            'pending_approval'
        );
        console.log(`✅ SUCESSO: Empresa ativada para pending_approval.`);

        // ==========================================
        // Disparo de Notificações (Em Background)
        // ==========================================
        const company = await this.businessRepository.findById(transaction.payer_business_info_uuid.uuid);

        if (company) {
            this.sendPaymentNotifications(company, expectedAmountInCents).catch(err => {
                console.error("[Webhook] Falha silenciosa no envio de emails de pagamento:", err);
            });
        }
    }

    private async sendPaymentNotifications(company: any, amountInCents: number): Promise<void> {
        const senderAddress = process.env.MAIL_ACCOUNT_NOREPLY_USER;
        const adminAlertEmail = process.env.ADMIN_ALERT_EMAIL;

        if (!senderAddress) {
            console.warn("Remetente (MAIL_ACCOUNT_NOREPLY_USER) não configurado. E-mails não foram enviados.");
            return;
        }

        const valorReais = (amountInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // 1. E-mail para a Empresa (Lojista)
        const partnerSubject = "Pagamento Recebido! Sua conta está em análise.";
        const partnerBody = `
            <div style="font-family: sans-serif; color: #333;">
                <h2>Olá, equipe da ${company.fantasy_name}!</h2>
                <p>Recebemos a confirmação do seu pagamento via PIX no valor de <strong>${valorReais}</strong>.</p>
                <p>O seu status atual agora é <b>Em Análise</b>.</p>
                <p>A nossa equipe já foi notificada e está revisando as suas informações. Em breve, você receberá as instruções finais para acessar o seu painel de parceiro.</p>
                <br/>
                <p>Abraços,</p>
                <p><strong>Equipe Correct</strong></p>
            </div>
        `;

        const sendToPartner = this.mailProvider.sendMail({
            to: company.email,
            subject: partnerSubject,
            body: partnerBody,
            from: { name: "Plataforma Correct", address: senderAddress }
        });

        // 2. E-mail para o Admin da Correct (Alerta Interno)
        let sendToAdmin = Promise.resolve();
        if (adminAlertEmail) {
            const adminSubject = `✅ PIX Confirmado: ${company.fantasy_name}`;
            const adminBody = `
                <div style="font-family: sans-serif; color: #333;">
                    <h2>Pagamento de Taxa de Adesão Confirmado</h2>
                    <p>O lojista efetuou o pagamento e o status no banco foi alterado para <b>pending_approval</b>.</p>
                    <ul>
                        <li><strong>Fantasia:</strong> ${company.fantasy_name}</li>
                        <li><strong>Documento:</strong> ${company.document}</li>
                        <li><strong>Valor Pago:</strong> ${valorReais}</li>
                    </ul>
                    <p>Por favor, acesse o painel administrativo para validar os dados e liberar o acesso final da loja.</p>
                </div>
            `;

            sendToAdmin = this.mailProvider.sendMail({
                to: adminAlertEmail,
                subject: adminSubject,
                body: adminBody,
                from: { name: "Notificações Syscorrect", address: senderAddress }
            });
        }

        await Promise.allSettled([sendToPartner, sendToAdmin]);
    }
}
