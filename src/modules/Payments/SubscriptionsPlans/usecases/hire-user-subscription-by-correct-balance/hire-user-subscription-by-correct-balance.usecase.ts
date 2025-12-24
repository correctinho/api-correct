import { addMonths, addYears } from 'date-fns';
import { SubscriptionStatus, TransactionStatus, TransactionType } from "@prisma/client";

import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";

// Interfaces de Repositórios
import { ISubscriptionPlanRepository } from "../../repositories/subscription-plan.repository";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { IBenefitsRepository } from "../../../../benefits/repositories/benefit.repository";
import { ITermsOfServiceRepository } from "../../../../Terms/repositories/terms-of-service.repository";
import { ISubscriptionRepository } from "../../repositories/subscription.repository"; // A interface atualizada

// DTOs
import {
    InputHireUserSubscriptionByCorrectBalanceDTO,
    OutputHireUserSubscriptionByCorrectBalanceDTO
} from "./dto/hire-user-subscription-by-correct-balance.dto";

import { AppUserItemEntity } from '../../../../AppUser/AppUserManagement/entities/app-user-item.entity';
import { SubscriptionEntity } from '../../entities/subscription.entity';
import { TransactionEntity } from '../../../Transactions/entities/transaction-order.entity';
import { TermAcceptanceEntity } from '../../../../Terms/entities/term-acceptance.entity';
import { TermsTypeEnum } from '../../../../Terms/entities/enums/terms-type.enum';
import { UserItemStatusEnum } from '../../../../AppUser/AppUserManagement/enums/user-item-status.enum';

export class HireUserSubscriptionByCorrectBalanceUsecase {
    constructor(
        private readonly planRepository: ISubscriptionPlanRepository,
        private readonly userItemRepository: IAppUserItemRepository,
        private readonly benefitsRepository: IBenefitsRepository,
        private readonly termsRepository: ITermsOfServiceRepository,
        private readonly subscriptionRepository: ISubscriptionRepository,
        
    ) { }

    async execute(input: InputHireUserSubscriptionByCorrectBalanceDTO): Promise<OutputHireUserSubscriptionByCorrectBalanceDTO> {
        const userUuidVO = new Uuid(input.userId);
        const planUuidVO = new Uuid(input.subscriptionPlanUuid);
        const termsUuidVO = new Uuid(input.acceptedTermsVersionUuid);
        const adminWalletUuid = process.env.CORRECT_ADMIN_WALLET_UUID;

        if (!adminWalletUuid) {
            // Isso protege seu sistema de rodar com configuração faltando
            throw new CustomError("Erro Crítico: Carteira Admin (CORRECT_ADMIN_WALLET_UUID) não configurada no ambiente.", 500);
}

        // ==================================================================
        // 1. VALIDAÇÕES INICIAIS (Leituras)
        // ==================================================================

        // 1.1. Validar o Plano
        const plan = await this.planRepository.find(planUuidVO);
        if (!plan || !plan.is_active) throw new CustomError("Plano não encontrado ou inativo.", 404);
        if (plan.payer_type !== 'USER') throw new CustomError("Plano inválido para contratação direta.", 403);

        const planPriceInCents = Math.round(plan.price * 100);
        // 1.2. Validar Duplicidade de Assinatura Ativa
        const existingActiveSub = await this.subscriptionRepository.findActiveByUserAndPlan(userUuidVO, planUuidVO);
        if (existingActiveSub) {
            throw new CustomError("Você já possui uma assinatura ativa para este plano.", 409);
        }

        // 1.3. Validar os Termos de Uso Aceitos
        const termsVersion = await this.termsRepository.find(termsUuidVO);
        if (!termsVersion) throw new CustomError("Versão dos termos não encontrada.", 400);
        // Verifica se está ativo e se é do tipo B2C correto
        if (!termsVersion.is_active || termsVersion.type !== TermsTypeEnum.B2C_APP_USER_EULA) {
            throw new CustomError("Os termos aceitos não são os vigentes ou são inválidos. Por favor, atualize e aceite novamente.", 409);
        }

        // 1.4. Buscar a Conta Correct (Hub) e Validar Saldo
        const hubAccountEntity = await this.userItemRepository.findDebitUserItem(userUuidVO.uuid);
        if (!hubAccountEntity) throw new CustomError("Conta principal (Saldo Correct) não encontrada para este usuário.", 404);
        const userBalanceInCents = Math.round(hubAccountEntity.balance * 100);

        if (userBalanceInCents < planPriceInCents) {
            throw new CustomError(
                `Saldo insuficiente. Necessário: R$ ${plan.price.toFixed(2)}, Disponível: R$ ${hubAccountEntity.balance.toFixed(2)}`, 
                402
            );
        }

        // 1.5. Buscar dados técnicos do benefício sendo comprado
        const itemTechnicalUuidVO = plan.item_uuid;
        const itemTechnical = await this.benefitsRepository.find(itemTechnicalUuidVO);
        if (!itemTechnical) throw new CustomError("Erro interno: Item técnico do plano não encontrado.", 500);


        // ==================================================================
        // 2. PREPARAÇÃO DAS ENTIDADES (Em memória)
        // ==================================================================
        console.log('[HireSubBalance] Validações OK. Preparando entidades para transação...');

        const startDate = new Date();
        let endDate: Date;
        // Cálculo da data de fim baseado na periodicidade do plano
        switch (plan.billing_period) {
            case 'MONTHLY': endDate = addMonths(startDate, 1); break;
            case 'YEARLY': endDate = addYears(startDate, 1); break;
            // Caso default para one-time/lifetime
            default: endDate = addYears(startDate, 100); break;
        }

        // 2.1. Preparar o UserItem (Benefício)
        // Verifica se o usuário já teve esse item antes para reutilizar o UUID
        const existingUserItem = await this.userItemRepository.findSpecificUserItem(userUuidVO.uuid, itemTechnicalUuidVO.uuid, null);
        const targetUserItemUuid = existingUserItem ? existingUserItem.uuid : new Uuid();

        // Cria a entidade do item já como ACTIVE, pois o pagamento é imediato
        const targetUserItemEntity = AppUserItemEntity.create({
            uuid: targetUserItemUuid, // Reutiliza ou novo
            user_info_uuid: userUuidVO,
            business_info_uuid: null, // B2C
            item_uuid: itemTechnicalUuidVO,
            item_name: itemTechnical.name,
            item_category: (itemTechnical as any).item_category,
            item_type: (itemTechnical as any).item_type,
            balance: 0,
            status: UserItemStatusEnum.ACTIVE, // <--- ATIVO IMEDIATAMENTE
            group_uuid: null,
            group_name: 'Assinatura Individual',
            group_value: plan.price,
            group_is_default: false,
            img_url: itemTechnical.img_url || null
        });

        // 2.2. Preparar a Assinatura (ACTIVE)
        const subscriptionEntity = SubscriptionEntity.createForUserRequest({
            user_info_uuid: userUuidVO,
            subscription_plan_uuid: planUuidVO,
            plan_billing_period: plan.billing_period,
            user_item_uuid: targetUserItemEntity.uuid
        });
        // Forçamos a ativação imediata e definimos as datas calculadas
        subscriptionEntity.activateSubscription(startDate, endDate);


        // 2.3. Preparar a Transação Financeira (SUCCESS)
        const transactionEntity = TransactionEntity.createCompletedSubscriptionPayment({
            subscription_uuid: subscriptionEntity.uuid,
            user_info_uuid: userUuidVO,
            hub_account_item_uuid: hubAccountEntity.uuid, // Origem do dinheiro
            amountInCents: planPriceInCents,
            description: `Assinatura: ${plan.name}`
        });

        // 2.4. Preparar o Aceite dos Termos (Vinculado à transação)
        const termAcceptanceEntity = TermAcceptanceEntity.createForAppUser({
            userUuid: userUuidVO,
            termsUuid: termsUuidVO,
            transactionUuid: transactionEntity.uuid, // VÍNCULO CRUCIAL
            ipAddress: input.ip_address,
            userAgent: input.user_agent
        });

        // ==================================================================
        // 3. EXECUÇÃO TRANSAÇÃO ATÔMICA (Delegada ao Repositório)
        // ==================================================================
        console.log('[HireSubBalance] Chamando repositório para execução atômica...');

        await this.subscriptionRepository.executeCheckoutWithBalance(
            subscriptionEntity,
            targetUserItemEntity,
            transactionEntity,
            termAcceptanceEntity,
            hubAccountEntity.uuid, 
            planPriceInCents,
            adminWalletUuid
        );

        console.log('[HireSubBalance] Contratação finalizada com sucesso.');

        // ==================================================================
        // 4. RETORNO
        // ==================================================================
        return {
            subscriptionUuid: subscriptionEntity.uuid.uuid,
            status: SubscriptionStatus.ACTIVE,
            startDate: startDate,
            endDate: endDate,
            itemName: itemTechnical.name
        };
    }
}