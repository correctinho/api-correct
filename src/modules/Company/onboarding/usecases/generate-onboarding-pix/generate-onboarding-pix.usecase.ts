import { IOnboardingPixRepository } from "../../repositories/IOnboardingPixRepository";
import { InputGenerateOnboardingPixDTO, OutputGenerateOnboardingPixDTO } from "./generate-onboarding-pix.dto";
import { IPixProvider } from "../../../../../infra/providers/PixProvider/IPixProvider";
import { CustomError } from "../../../../../errors/custom.error";

export class GenerateOnboardingPixUseCase {
    constructor(
        private repository: IOnboardingPixRepository,
        private pixProvider: IPixProvider
    ) { }

    async execute(data: InputGenerateOnboardingPixDTO): Promise<OutputGenerateOnboardingPixDTO> {
        const businessInfo = await this.repository.getBusinessInfo(data.business_info_uuid);

        if (!businessInfo) {
            throw new CustomError("Empresa não encontrada", 404);
        }

        if (businessInfo.status !== "awaiting_payment") {
            throw new CustomError("A empresa não está aguardando pagamento de adesão", 400);
        }

        const configValue = await this.repository.getSystemConfig("ONBOARDING_FEE_CENTS");
        const feeCents = configValue ? parseInt(configValue, 10) : 20000;

        if (isNaN(feeCents)) {
            throw new CustomError("Configuração de taxa inválida no sistema", 500);
        }

        // Converte centavos (20000) para string de Reais ("200.00") que o Sicredi exige
        const valorString = (feeCents / 100).toFixed(2);

        const pixKey = process.env.SICREDI_PIX_KEY;
        if (!pixKey) {
            throw new CustomError("Chave PIX não configurada no servidor", 500);
        }

        // 1. Chama a integração real
        const chargeResult = await this.pixProvider.createImmediateCharge({
            cpf: businessInfo.document,
            nome: businessInfo.fantasy_name,
            valor: valorString,
            chave: pixKey,
            solicitacaoPagador: "Taxa de Adesão"
        });

        // 2. Grava a intenção financeira no banco para o Webhook achar depois
        await this.repository.createPendingTransaction({
            payer_business_info_uuid: businessInfo.uuid,
            provider_tx_id: chargeResult.txid,
            original_price: feeCents,
            net_price: feeCents
        });

        return {
            txid: chargeResult.txid,
            pixCopiaECola: chargeResult.pixCopiaECola,
            expirationDate: chargeResult.expirationDate
        };
    }
}