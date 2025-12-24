import { Request, Response } from "express";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { IBenefitsRepository } from "../../../../benefits/repositories/benefit.repository";
import { ITermsOfServiceRepository } from "../../../../Terms/repositories/terms-of-service.repository";
import { ISubscriptionPlanRepository } from "../../repositories/subscription-plan.repository";
import { ISubscriptionRepository } from "../../repositories/subscription.repository";
import { CustomError } from "../../../../../errors/custom.error";
import { HireUserSubscriptionByCorrectBalanceUsecase } from "./hire-user-subscription-by-correct-balance.usecase";
// IMPORTANTE: Adicione o import do DTO de entrada
import { InputHireUserSubscriptionByCorrectBalanceDTO } from "./dto/hire-user-subscription-by-correct-balance.dto";
import { IPasswordCrypto } from "../../../../../crypto/password.crypto";

export class HireUserSubscriptionByCorrectBalanceController {
    constructor(
        private readonly planRepository: ISubscriptionPlanRepository,
        private readonly userItemRepository: IAppUserItemRepository,
        private readonly benefitsRepository: IBenefitsRepository,
        private readonly termsRepository: ITermsOfServiceRepository,
        private readonly subscriptionRepository: ISubscriptionRepository,
        private readonly hashService: IPasswordCrypto
    ) { }

    async handle(req: Request, res: Response): Promise<Response> {
        try {
            // 1. Obter dados do usuário autenticado via middleware
            // Assumindo que req.appUser já está tipado corretamente na sua aplicação
            const userId = req.appUser.user_info_uuid; 
            const transactionPinHash = req.appUser.transaction_pin;

            // 2. Extrair dados do corpo da requisição
            // Usaremos 'transaction_pin' como nome padrão para o que vem do front
            const { subscription_plan_uuid, accepted_terms_version_uuid, transaction_pin } = req.body;

            // === VALIDAÇÕES DE SEGURANÇA (PIN) ===
            
            // 2.1. Verifica se o usuário tem PIN configurado na conta
            if (!transactionPinHash) {
                throw new CustomError("Você precisa configurar um PIN de transação antes de realizar compras.", 403);
            }

            // 2.2. Verifica se o PIN foi enviado na requisição
            if (!transaction_pin) {
                throw new CustomError("O PIN de transação é obrigatório para confirmar a compra.", 400);
            }

            // 2.3. REALIZA A COMPARAÇÃO (Hash do banco vs PIN digitado)
            const isPinValid = await this.hashService.compare(transaction_pin, transactionPinHash);

            if (!isPinValid) {
                // Se o PIN estiver errado, barramos aqui. O UseCase nem será instanciado.
                throw new CustomError("PIN de transação incorreto.", 401);
            }

            // === FIM DAS VALIDAÇÕES DE SEGURANÇA ===


            // 3. Validação básica dos outros campos
            if (!subscription_plan_uuid || !accepted_terms_version_uuid) {
                throw new CustomError("Os campos 'subscription_plan_uuid' e 'accepted_terms_version_uuid' são obrigatórios.", 400);
            }

            // 4. Extrair dados de auditoria
            let ipAddressHeader = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const ipAddress = Array.isArray(ipAddressHeader) ? ipAddressHeader[0] : ipAddressHeader;
            const userAgent = req.headers['user-agent'];


            // 5. Montar o DTO para o UseCase
            // NÃO enviamos mais o PIN, pois já foi validado acima.
            const inputDto: InputHireUserSubscriptionByCorrectBalanceDTO = {
                userId: userId,
                subscriptionPlanUuid: subscription_plan_uuid,
                acceptedTermsVersionUuid: accepted_terms_version_uuid,
                ip_address: ipAddress || null,
                user_agent: userAgent || null
            };

            
            // 6. Instanciar e executar o UseCase (ele volta a ser simples, sem dependências de auth)
            const usecase = new HireUserSubscriptionByCorrectBalanceUsecase(
                this.planRepository,
                this.userItemRepository,
                this.benefitsRepository,
                this.termsRepository,
                this.subscriptionRepository
            );

            const result = await usecase.execute(inputDto);

            // 7. Retornar sucesso (201 Created)
            return res.status(201).json(result);

        } catch (err: any) {
            // Tratamento de erro padrão
            const statusCode = err instanceof CustomError ? err.statusCode : 500;
            // Logs de erro 500 são importantes para debug
            if (statusCode === 500) {
                console.error("[HireSubBalanceController] Erro interno não tratado:", err);
            }
            return res.status(statusCode).json({
                error: err.message || "Internal Server Error",
            });
        }
    }
}