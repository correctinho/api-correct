// import { addMonths, addYears } from 'date-fns';
// import { PrismaClient, UserItemStatus, SubscriptionStatus, TransactionType, TransactionStatus, TermsType } from "@prisma/client";

// import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
// import { CustomError } from "../../../../../errors/custom.error";

// // Repositórios para leituras
// import { ISubscriptionPlanRepository } from "../../repositories/subscription-plan.repository";
// import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
// import { IBenefitsRepository } from "../../../../benefits/repositories/benefit.repository";
// // Assumindo que você criará este repositório simples para ler os termos

// // NOVOS NOMES DOS IMPORTS DOS DTOs
// import { 
//     InputHireUserSubscriptionByCorrectBalanceDTO, 
//     OutputHireUserSubscriptionByCorrectBalanceDTO 
// } from "./dto/hire-user-subscription-by-correct-balance.dto";

// // NOVO NOME DA CLASSE
// export class HireUserSubscriptionByCorrectBalanceUsecase {
//     constructor(
//         // Injetamos o cliente Prisma bruto para poder abrir transações
//         private readonly prisma: PrismaClient,
//         // Repositórios para validações de leitura
//         private readonly planRepository: ISubscriptionPlanRepository,
//         private readonly userItemRepository: IAppUserItemRepository,
//         private readonly benefitsRepository: IBenefitsRepository,
//         private readonly termsRepository: ITermsOfServiceRepository
//     ) {}

//     // NOVA ASSINATURA DO MÉTODO EXECUTE
//     async execute(input: InputHireUserSubscriptionByCorrectBalanceDTO): Promise<OutputHireUserSubscriptionByCorrectBalanceDTO> {
//         const userUuidVO = new Uuid(input.userId);
//         const planUuidVO = new Uuid(input.subscriptionPlanUuid);
//         const termsUuidVO = new Uuid(input.acceptedTermsVersionUuid);

//         // ==================================================================
//         // 1. VALIDAÇÕES INICIAIS (Leituras fora da transação)
//         // ==================================================================

//         // 1.1. Validar o Plano
//         const plan = await this.planRepository.find(planUuidVO);
//         if (!plan || !plan.is_active) throw new CustomError("Plano não encontrado ou inativo.", 404);
//         if (plan.payer_type !== 'USER') throw new CustomError("Plano inválido para contratação direta.", 403);

//         // 1.2. Validar Duplicidade
//         // (Lembre-se de implementar findActiveByUserAndPlan no repositório se necessário)
//         // const existingActiveSub = await this.subscriptionRepository.findActiveByUserAndPlan(userUuidVO, planUuidVO);
//         // if (existingActiveSub) throw new CustomError("Você já possui uma assinatura ativa deste plano.", 409);

//         // 1.3. Validar os Termos de Uso Aceitos
//         const termsVersion = await this.termsRepository.findById(termsUuidVO.uuid);
//         if (!termsVersion) throw new CustomError("Versão dos termos não encontrada.", 400);
//         if (!termsVersion.is_active || termsVersion.type !== TermsType.B2C_APP_USER_EULA) {
//              throw new CustomError("Os termos aceitos não são os vigentes. Por favor, leia e aceite novamente.", 409);
//         }

//         // 1.4. Buscar a Conta Correct (Hub) e Validar Saldo
//         const hubAccountEntity = await this.userItemRepository.findHubAccountByUser(userUuidVO.uuid);

//         if (!hubAccountEntity) throw new CustomError("Conta principal (Correct) não encontrada.", 404);
        
//         // Validação de saldo (valores em centavos)
//         if (hubAccountEntity.balance < plan.price) {
//              throw new CustomError("Saldo insuficiente na conta Correct.", 402);
//         }

//         // 1.5. Buscar dados do Item Técnico (o benefício sendo vendido)
//         const itemTechnicalUuidVO = new Uuid(plan.item_uuid);
//         const itemTechnical = await this.benefitsRepository.find(itemTechnicalUuidVO);
//         if (!itemTechnical) throw new CustomError("Item técnico do plano não encontrado.", 500);

//         // ==================================================================
//         // 2. PREPARAÇÃO DE DADOS
//         // ==================================================================

//         // 2.1. Calcular Datas de Vigência
//         const startDate = new Date();
//         let endDate: Date;
//         if (plan.billing_period === 'MONTHLY') {
//             endDate = addMonths(startDate, 1);
//         } else if (plan.billing_period === 'YEARLY') {
//             endDate = addYears(startDate, 1);
//         } else {
//              endDate = addYears(startDate, 100); // Vitalício/One-time
//         }

//         // 2.2. Verificar UserItem existente
//         const existingUserItemEntity = await this.userItemRepository.findSpecificUserItem(userUuidVO.uuid, itemTechnicalUuidVO.uuid, null);
//         const targetUserItemUuid = existingUserItemEntity ? existingUserItemEntity.uuid.uuid : new Uuid().uuid;

//         // UUIDs para os novos registros
//         const newSubscriptionUuid = new Uuid().uuid;
//         const newTransactionUuid = new Uuid().uuid;
//         const newAcceptanceUuid = new Uuid().uuid;

//         // ==================================================================
//         // 3. TRANSAÇÃO ATÔMICA
//         // ==================================================================
        
//         // Logs atualizados com o novo prefixo [HireSubCorrectBalance]
//         await this.prisma.$transaction(async (tx) => {
//             console.log(`[HireSubCorrectBalance] Iniciando transação para user ${input.userId}, plano ${plan.name}, valor ${plan.price}`);

//             // A) DÉBITO: Subtrair saldo da conta Hub
//             const debitResult = await tx.userItem.updateMany({
//                 where: {
//                     uuid: hubAccountEntity.uuid.uuid,
//                     balance: { gte: plan.price } // Concorrência otimista
//                 },
//                 data: {
//                     balance: { decrement: plan.price },
//                     updated_at: new Date()
//                 }
//             });

//             if (debitResult.count === 0) {
//                 throw new CustomError("Saldo insuficiente (concorrência detectada). Tente novamente.", 409);
//             }
//             console.log('[HireSubCorrectBalance] Débito realizado com sucesso.');


//             // B) PROVISIONAMENTO: Criar ou Atualizar o UserItem do benefício
//             const userItemData = {
//                 user_info_uuid: input.userId,
//                 item_uuid: plan.item_uuid,
//                 item_name: itemTechnical.name,
//                 item_category: (itemTechnical as any).item_category,
//                 item_type: (itemTechnical as any).item_type,
//                 status: UserItemStatus.active, // <-- ATIVO IMEDIATAMENTE
//                 updated_at: new Date()
//             };

//             if (existingUserItemEntity) {
//                 await tx.userItem.update({
//                     where: { uuid: targetUserItemUuid },
//                     data: userItemData
//                 });
//             } else {
//                 await tx.userItem.create({
//                     data: {
//                         uuid: targetUserItemUuid,
//                         ...userItemData,
//                         balance: 0,
//                         business_info_uuid: null,
//                         created_at: new Date()
//                     }
//                 });
//             }
//             console.log('[HireSubCorrectBalance] UserItem provisionado/ativado.');


//             // C) ASSINATURA: Criar o registro ativo com datas de fim
//             await tx.subscription.create({
//                 data: {
//                     uuid: newSubscriptionUuid,
//                     subscription_plan_uuid: plan.uuid.uuid,
//                     user_info_uuid: input.userId,
//                     user_item_uuid: targetUserItemUuid,
//                     status: SubscriptionStatus.ACTIVE, // <-- ATIVA IMEDIATAMENTE
//                     start_date: startDate,
//                     end_date: endDate, // <-- DATA DE EXPIRAÇÃO CRUCIAL
//                     created_at: new Date(),
//                     updated_at: new Date()
//                 }
//             });
//             console.log('[HireSubCorrectBalance] Assinatura criada como ACTIVE.');


//             // D) TRANSAÇÃO FINANCEIRA: Registrar o histórico
//             await tx.transactions.create({
//                 data: {
//                     uuid: newTransactionUuid,
//                     user_item_uuid: hubAccountEntity.uuid.uuid,
//                     subscription_uuid: newSubscriptionUuid,
//                     amount: plan.price,
//                     transaction_type: TransactionType.SUBSCRIPTION_PAYMENT,
//                     status: TransactionStatus.success, // <-- SUCESSO IMEDIATO
//                     description: `Contratação: ${plan.name}`,
//                     created_at: new Date(),
//                     updated_at: new Date()
//                 }
//             });
//             console.log('[HireSubCorrectBalance] Histórico financeiro registrado.');


//             // E) TERMOS DE USO: Registrar o aceite
//             await tx.termAcceptance.create({
//                 data: {
//                     uuid: newAcceptanceUuid,
//                     app_user_info_uuid: input.userId,
//                     company_user_uuid: null,
//                     terms_uuid: input.acceptedTermsVersionUuid,
//                     transaction_uuid: newTransactionUuid,
//                     accepted_at: new Date(),
//                 }
//             });
//             console.log('[HireSubCorrectBalance] Aceite dos termos registrado.');

//         }); // Fim da transação

//         console.log('[HireSubCorrectBalance] Transação completa com sucesso!');

//         // 4. Retornar DTO de Sucesso
//         return {
//             subscriptionUuid: newSubscriptionUuid,
//             status: SubscriptionStatus.ACTIVE,
//             startDate: startDate,
//             endDate: endDate,
//             itemName: itemTechnical.name
//         };
//     }
// }