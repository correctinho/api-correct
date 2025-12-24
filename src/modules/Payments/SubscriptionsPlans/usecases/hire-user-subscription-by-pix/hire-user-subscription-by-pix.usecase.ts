import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";

// Interfaces de Repositório do Módulo Financeiro
import { ISubscriptionPlanRepository } from "../../repositories/subscription-plan.repository";
import { ISubscriptionRepository } from "../../repositories/subscription.repository";
import { ITransactionOrderRepository } from "../../../Transactions/repositories/transaction-order.repository";

// Interfaces de Repositório do Módulo AppUser/Benefits
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { IBenefitsRepository } from "../../../../benefits/repositories/benefit.repository";

// Interfaces de Repositório do Módulo Terms (NOVOS)
import { ITermsOfServiceRepository } from "../../../../Terms/repositories/terms-of-service.repository";
import { ITermsOfAcceptanceRepository } from "../../../../Terms/repositories/terms-of-acceptance.repository";

// Provider
import { IPixProvider, PixChargeCreationData } from "../../../../../infra/providers/PixProvider/IPixProvider";

// DTOs
import { InputHireUserSubscriptionByPixDto, OutputHireUserSubscriptionByPixDto } from "./dto/create-user-subscription.dto";

// Entidades e s
import { AppUserItemEntity } from "../../../../AppUser/AppUserManagement/entities/app-user-item.entity";
import { SubscriptionEntity } from "../../entities/subscription.entity";
import { TransactionEntity } from "../../../Transactions/entities/transaction-order.entity";
import { TermAcceptanceEntity } from "../../../../Terms/entities/term-acceptance.entity"; // Nova entidade
import { TermsTypeEnum } from "../../../../Terms/entities/enums/terms-type.enum";
import { UserItemStatusEnum } from "../../../../AppUser/AppUserManagement/enums/user-item-status.enum";

// --- CONFIGURAÇÃO ---
const COMPANY_PIX_KEY = process.env.SICREDI_PIX_KEY

export class HireUserSubscriptionByPixUsecase {
  constructor(
    private subscriptionPlanRepository: ISubscriptionPlanRepository,
    private subscriptionRepository: ISubscriptionRepository,
    private userInfoRepository: IAppUserInfoRepository,
    private pixProvider: IPixProvider,
    private userItemRepository: IAppUserItemRepository,
    private benefitsRepository: IBenefitsRepository,
    private transactionRepository: ITransactionOrderRepository,
    // Injeção dos repositórios de termos 
    private termsRepository: ITermsOfServiceRepository,
    private termAcceptanceRepository: ITermsOfAcceptanceRepository
  ) {}

  async execute(input: InputHireUserSubscriptionByPixDto): Promise<OutputHireUserSubscriptionByPixDto> {
    const userUuid = new Uuid(input.user_info_uuid);
    const planUuid = new Uuid(input.subscription_plan_uuid);
    // Extrai o UUID dos termos aceitos do DTO de entrada
    const acceptedTermsUuid = new Uuid(input.accepted_terms_version_uuid);

    console.log(`[HireSubPix] Iniciando processo para usuário ${userUuid.uuid}, plano ${planUuid.uuid}`);

    // 1. Validar o Plano
    const plan = await this.subscriptionPlanRepository.find(planUuid);
    if (!plan || !plan.is_active) {
        throw new CustomError("Plano de assinatura não encontrado ou inativo.", 404);
    }
    if (plan.payer_type !== 'USER') {
        throw new CustomError("Este plano não está disponível para contratação direta.", 403);
    }

    // 2. Verificar Duplicidade de Assinatura ATIVAS
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
    // NOVA VALIDAÇÃO: TERMOS DE USO
    // =================================================================
    console.log(`[HireSubPix] Validando versão dos termos aceitos: ${acceptedTermsUuid.uuid}...`);
    const termsVersion = await this.termsRepository.find(acceptedTermsUuid);
    
    if (!termsVersion) {
         throw new CustomError("Versão dos termos de uso não encontrada.", 400);
    }

    // Verifica se o termo é do tipo correto (B2C) e se está ativo.
    // O usuário não pode aceitar um termo antigo ou de outro tipo.
    if (!termsVersion.is_active || termsVersion.type !== TermsTypeEnum.B2C_APP_USER_EULA) {
         console.warn(`[HireSubPix] Tentativa de aceite de termos inválidos. Ativo: ${termsVersion.is_active}, Tipo: ${termsVersion.type}`);
         // Código 409 Conflict indica que o estado atual do servidor (termos vigentes)
         // conflita com o que o cliente enviou.
         throw new CustomError("Os termos aceitos não são a versão vigente atual. Por favor, atualize e aceite novamente.", 409);
    }
    console.log('[HireSubPix] Termos de uso validados com sucesso.');

    // =================================================================
    // 4. GESTÃO DO USER ITEM 
    // =================================================================
    const itemUuid = plan.item_uuid;
    const planPriceInCents = Math.round(plan.price * 100)

    console.log(`[HireSubPix] Verificando UserItem...`);
    // 4.1. Busca item existente APENAS para pegar o UUID (Reciclagem)
    const existingUserItem = await this.userItemRepository.findSpecificUserItem(
        userUuid.uuid, 
        itemUuid.uuid, 
        null
    );

    const targetUserItemUuid = existingUserItem 
        ? existingUserItem.uuid
        : new Uuid();
    
    // 4.2. Busca dados técnicos do benefício (Nome, Imagem, etc)
    const itemTechnical = await this.benefitsRepository.find(itemUuid);
    if (!itemTechnical) throw new CustomError("Item técnico não encontrado.", 500);

    // 4.3. Cria a Entidade (Sempre nova em memória, mas com ID potencialmente antigo)
    // ATENÇÃO: Status BLOCKED pois aguarda pagamento PIX
    const userItemEntity = AppUserItemEntity.create({
        uuid: targetUserItemUuid, // Reutiliza ou Novo
        user_info_uuid: userUuid,
        business_info_uuid: null, 
        item_uuid: itemUuid,
        item_name: itemTechnical.name,
        item_category: (itemTechnical as any).item_category, 
        item_type: (itemTechnical as any).item_type,
        
        balance: 0, // Pix não adiciona saldo, é acesso ao serviço
        status: UserItemStatusEnum.BLOCKED, // <--- TRAVA O ACESSO ATÉ O PIX CAIR
        
        group_uuid: null,
        group_name: 'Assinatura Individual',
        group_value: plan.price, 
        group_is_default: false,
        img_url: itemTechnical.img_url || null
    });
    // 4.4. Persistência Única (Upsert resolve se cria ou atualiza)
    await this.userItemRepository.upsert(userItemEntity);
    console.log(`[HireSubPix] UserItem ${userItemEntity.uuid} preparado (BLOCKED).`);

    // =================================================================
    // 5. GESTÃO DA ASSINATURA E FINANCEIRO
    // =================================================================
    console.log('[HireSubPix] Criando entidade de assinatura PENDING...');
    const newSubscription = SubscriptionEntity.createForUserRequest({
        user_info_uuid: userUuid,
        subscription_plan_uuid: planUuid,
        plan_billing_period: plan.billing_period,
        user_item_uuid: userItemEntity.uuid
    });
    
    // 5.2. Gerar o PIX
    const amountInReaisString = (plan.rawPriceInCents / 100).toFixed(2);
    console.log(`[HireSubPix] Gerando PIX de R$ ${amountInReaisString}...`);
    const PIX_EXPIRATION_SECONDS = 86400
    const chargeData: PixChargeCreationData = {
        cpf: user.document.replace(/\D/g, ''),
        nome: user.full_name,
        valor: amountInReaisString,
        chave: COMPANY_PIX_KEY!, // Assegurando que existe
        solicitacaoPagador: `Assinatura Correct: ${plan.name}`.substring(0, 140),
        expiracaoSegundos: PIX_EXPIRATION_SECONDS
    };

    
    const pixResult = await this.pixProvider.createImmediateCharge(chargeData);
    console.log('[HireSubPix] PIX gerado. TXID:', pixResult.txid);
    // =================================================================
    // 6. PERSISTÊNCIA (Assinatura e Transação)
    // =================================================================
    console.log(`[HireSubPix] Salvando assinatura...`);
    await this.subscriptionRepository.upsert(newSubscription);

    console.log('[HireSubPix] Registrando transação PENDING...');
    const newTransaction = TransactionEntity.createForSubscriptionPixPayment({
        subscription_uuid: newSubscription.uuid,
        user_info_uuid: userUuid,
        user_item_uuid: userItemEntity.uuid,
        amountInCents: plan.rawPriceInCents,
        provider_tx_id: pixResult.txid
    });
    // Salva a transação. Agora temos o UUID dela para vincular ao termo.
    await this.transactionRepository.upsert(newTransaction);
    console.log(`[HireSubPix] Transação ${newTransaction.uuid.uuid} salva.`);

    // =================================================================
    // 7: REGISTRAR O ACEITE DOS TERMOS
    // =================================================================
    console.log('[HireSubPix] Registrando aceite dos termos...');
    // Cria a entidade de aceite, vinculando-a à transação recém-criada.
    const termAcceptance = TermAcceptanceEntity.createForAppUser({
        userUuid: userUuid,
        termsUuid: acceptedTermsUuid,
        transactionUuid: newTransaction.uuid, // VÍNCULO CRUCIAL PARA AUDITORIA
        ipAddress: input.ip_address,
        userAgent: input.user_agent
    });

    // Salva o aceite no repositório específico
    await this.termAcceptanceRepository.create(termAcceptance);
    console.log('[HireSubPix] Aceite registrado com sucesso.');


    // 8. Retornar os dados para o App
    return {
        subscription_uuid: newSubscription.uuid.uuid,
        user_item_uuid: userItemEntity.uuid.uuid,
        status: newSubscription.status, // 'PENDING_PAYMENT'
        pix_qr_code: pixResult.pixCopiaECola,
        pix_expiration: pixResult.expirationDate,
        amount_in_cents: plan.rawPriceInCents
    };
  }
}