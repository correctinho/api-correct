import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { ISubscriptionPlanRepository } from "../../repositories/subscription-plan.repository";
import { ISubscriptionRepository } from "../../repositories/subscription.repository";
import { IPixProvider, PixChargeCreationData } from "../../../../../infra/providers/PixProvider/IPixProvider"; // Ajuste o caminho se necessário
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { AppUserItemEntity } from "../../../../AppUser/AppUserManagement/entities/app-user-item.entity";
import { IBenefitsRepository } from "../../../../benefits/repositories/benefit.repository";
import { InputCreateUserSubscriptionDto, OutputCreateUserSubscriptionDto } from "./dto/create-user-subscription.dto";
import { UserItemStatus } from "@prisma/client"; // Import do enum de status
import { SubscriptionEntity } from "../../entities/subscription.entity";
import { TransactionEntity } from "../../../Transactions/entities/transaction-order.entity";
import { ITransactionOrderRepository } from "../../../Transactions/repositories/transaction-order.repository";

// --- CONFIGURAÇÃO ---
// IMPORTANTE: Substitua pela sua chave PIX real ou use process.env
const COMPANY_PIX_KEY = process.env.SICREDI_PIX_KEY


export class CreateUserSubscriptionUsecase {
  constructor(
    private subscriptionPlanRepository: ISubscriptionPlanRepository,
    private subscriptionRepository: ISubscriptionRepository,
    private userInfoRepository: IAppUserInfoRepository,
    private pixProvider: IPixProvider,
    private userItemRepository: IAppUserItemRepository,
    private benefitsRepository: IBenefitsRepository,
    private transactionRepository: ITransactionOrderRepository // Injetar futuramente
  ) {}

  async execute(input: InputCreateUserSubscriptionDto): Promise<OutputCreateUserSubscriptionDto> {
    const userUuid = new Uuid(input.user_info_uuid);
    const planUuid = new Uuid(input.subscription_plan_uuid);
    // 1. Validar o Plano
    const plan = await this.subscriptionPlanRepository.find(planUuid);
    if (!plan || !plan.is_active) {
        throw new CustomError("Plano de assinatura não encontrado ou inativo.", 404);
    }
    if (plan.payer_type !== 'USER') {
        throw new CustomError("Este plano não está disponível para contratação direta.", 403);
    }

    // 2. Verificar Duplicidade de Assinatura ATIVA
    const existingActiveSub = await this.subscriptionRepository.findActiveByUserAndPlan(userUuid, planUuid);
    if (existingActiveSub) {
        throw new CustomError("Você já possui uma assinatura ativa para este plano.", 409);
    }
    // 3. Buscar Dados do Usuário (para o PIX)
    const user = await this.userInfoRepository.find(userUuid);
    if (!user || !user.document) {
        throw new CustomError("Dados do usuário incompletos (CPF faltando).", 400);
    }
    // =================================================================
    // 4. GESTÃO DO USER ITEM 
    // =================================================================
    const itemUuid = plan.item_uuid; // Uuid VO do item técnico

    // 4.1. Verifica se o usuário já tem esse item técnico B2C (passando null)
    console.log(`[CreateSub] Verificando existência de UserItem para usuário ${userUuid.uuid} e item ${itemUuid.uuid}...`);
    let userItem = await this.userItemRepository.findSpecificUserItem(userUuid.uuid, itemUuid.uuid, null);
    let isNewItem = false;
    console.log(`[CreateSub] UserItem encontrado: ${userItem ? userItem.uuid.uuid : 'Nenhum'}`);
    if (!userItem) {
        isNewItem = true;
        // 4.2. Se não tiver, CRIA um novo UserItem.
        const itemTechnical = await this.benefitsRepository.find(itemUuid);
        if (!itemTechnical) throw new CustomError("Item técnico não encontrado.", 500);

        console.log(`[CreateSub] Criando novo UserItem para usuário ${userUuid.uuid}`);

        //Usando valores em REAIS e null as any para business_info_uuid
        userItem = AppUserItemEntity.create({
            user_info_uuid: userUuid,
            business_info_uuid: null, 
            item_uuid: itemUuid,
            item_name: itemTechnical.name,
            item_category: (itemTechnical as any).item_category, 
            item_type: (itemTechnical as any).item_type,
            balance: 0.00, // Reais
            status: UserItemStatus.inactive, // Status inicial neutro
            group_uuid: null,
            group_name: 'Assinatura Individual',
            group_value: plan.price, // Reais (o getter .price já retorna em reais)
            group_is_default: false,
            img_url: itemTechnical.img_url || null
        });
        console.log(`[CreateSub] Novo UserItem criado com UUID ${userItem.uuid.uuid}`);
        // Garante que nasce bloqueado até pagar
        userItem.blockUserItem();

    } else {
        // 4.3. Se já tiver, REATIVA (mas mantém bloqueado até pagar).
        console.log(`[CreateSub] UserItem existente encontrado (${userItem.uuid.uuid}). Preparando.`);
        
        // Usando método da entidade para garantir estado bloqueado.
        // Se já estava ACTIVE, é um estado estranho (passou da validação do passo 2),
        // mas por segurança, bloqueamos também até o novo pagamento confirmar.
        if (userItem.status === UserItemStatus.active) {
             console.warn(`[CreateSub] UserItem ${userItem.uuid.uuid} estava ACTIVE mas sem assinatura ativa. Bloqueando.`);
        }
        userItem.blockUserItem();
    }

    // 4.4. Salva o UserItem (novo ou atualizado) no banco.
    // Usando create ou update dependendo se é novo ou não.
    if (isNewItem) {
        console.log(userItem)
        console.log(`[CreateSub] Salvando novo UserItem ${userItem.uuid.uuid} no banco...`);
        await this.userItemRepository.upsert(userItem);
    } else {
        console.log(`[CreateSub] Atualizando UserItem existente ${userItem.uuid.uuid} no banco...`);
        await this.userItemRepository.update(userItem);
    }
    console.log(`[CreateSub] UserItem ${userItem.uuid.uuid} salvo com sucesso.`);
    const userItemUuidFinal = userItem.uuid;

    // =================================================================
    // 5. GESTÃO DA ASSINATURA E FINANCEIRO
    // =================================================================

    // 5.1. Criar a Entidade de Assinatura (Status PENDING_PAYMENT)
    // Assumindo que a entidade SubscriptionEntity foi corrigida para aceitar user_item_uuid
    console.log('[CreateSub] Criando entidade de assinatura...');
    const newSubscription = SubscriptionEntity.createForUserRequest({
        user_info_uuid: userUuid,
        subscription_plan_uuid: planUuid,
        plan_billing_period: plan.billing_period,
        user_item_uuid: userItemUuidFinal
    });
    console.log(`[CreateSub] Entidade de assinatura criada com UUID ${newSubscription.uuid.uuid} e status ${newSubscription.status}.`);
    // 5.2. Gerar o PIX no Sicredi
    // Converte centavos (number) para string "9.00" para o Sicredi
    const amountInReaisString = (plan.rawPriceInCents / 100).toFixed(2);
    console.log(`[CreateSub] Preparando dados para criação do PIX no valor de R$ ${amountInReaisString}...`);
    const chargeData: PixChargeCreationData = {
        cpf: user.document.replace(/\D/g, ''), // Remove pontuação do CPF
        nome: user.full_name,
        valor: amountInReaisString,
        chave: COMPANY_PIX_KEY,
        // Limita a descrição a 140 caracteres
        solicitacaoPagador: `Assinatura Correct: ${plan.name}`.substring(0, 140)
    };

    console.log('[CreateSub] Solicitando PIX ao Sicredi...');
    // Chama o método correto dainterface
    const pixResult = await this.pixProvider.createImmediateCharge(chargeData);
    console.log('[CreateSub] PIX gerado com sucesso. TXID:', pixResult.txid);

    // =================================================================
    // 6. PERSISTIR A ASSINATURA NO BANCO (Deve vir ANTES da transação)
    // =================================================================
    console.log(`[CreateSub] Salvando assinatura ${newSubscription.uuid.uuid} no banco...`);
    await this.subscriptionRepository.upsert(newSubscription);
    console.log('[CreateSub] Assinatura salva com sucesso.');

// =================================================================
    // 7. REGISTRAR A TRANSAÇÃO FINANCEIRA (Agora pode ser salva)
    // =================================================================
    console.log('[CreateSub] Registrando transação financeira pendente...');

    const newTransaction = TransactionEntity.createForSubscriptionPixPayment({
        subscription_uuid: newSubscription.uuid, // O ID agora já existe no banco
        user_info_uuid: userUuid,
        user_item_uuid: userItemUuidFinal,
        amountInCents: plan.rawPriceInCents,
        provider_tx_id: pixResult.txid
    });
    // Salva a transação
    await this.transactionRepository.upsert(newTransaction);
    console.log(`[CreateSub] Transação registrada com sucesso. UUID: ${newTransaction.uuid.uuid}`);

    // 8. Retornar os dados para o App
    return {
        subscription_uuid: newSubscription.uuid.uuid,
        user_item_uuid: userItemUuidFinal.uuid,
        status: newSubscription.status, // 'PENDING_PAYMENT'
        pix_qr_code: pixResult.pixCopiaECola, // Campo correto do resultado
        pix_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h por padrão
        amount_in_cents: plan.rawPriceInCents
    };
  }
}