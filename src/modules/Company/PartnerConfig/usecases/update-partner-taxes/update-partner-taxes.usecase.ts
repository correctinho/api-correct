import { CustomError } from "../../../../../errors/custom.error";
import { IPartnerConfigRepository } from "../../repositories/partner-config.repository";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { IBusinessContractRepository } from "../../../../Terms/repositories/business-contract.repository";
import { GenerateBusinessContractUsecase } from "../../../../Terms/usecase/generate-business-contract/generate-business-contract.usecase";
import { BusinessStatus } from "@prisma/client";

export type UpdatePartnerTaxesInputDto = {
  business_info_uuid: string;
  admin_tax: number;
  marketing_tax: number;
  market_place_tax: number;
  cashback_tax: number;
};

export class UpdatePartnerTaxesUsecase {
  constructor(
    private repository: IPartnerConfigRepository,
    private businessInfoRepository: ICompanyDataRepository,
    private businessContractRepository: IBusinessContractRepository,
    private generateContractUsecase: GenerateBusinessContractUsecase
  ) {}

  async execute(input: UpdatePartnerTaxesInputDto): Promise<void> {
    const { business_info_uuid, admin_tax, marketing_tax, market_place_tax, cashback_tax } = input;

    // 1. Busca a empresa
    const business = await this.businessInfoRepository.findById(business_info_uuid);
    if (!business) {
      throw new CustomError('Business info not found', 404);
    }

    // 2. Removemos o bloqueio de status para permitir atualização de taxas de ativos.
    // (A validação original foi removida).

    // 3. Atualiza as taxas
    const partnerConfig = await this.repository.findByPartnerId(business_info_uuid);
    if (!partnerConfig) {
      throw new CustomError('Partner config not found', 404);
    }

    if (admin_tax !== undefined) {
      partnerConfig.changePendingAdminTax(Math.round(admin_tax * 10000));
    }
    if (marketing_tax !== undefined) {
      partnerConfig.changePendingMarketingTax(Math.round(marketing_tax * 10000));
    }
    if (market_place_tax !== undefined) {
      partnerConfig.changePendingMarketPlaceTax(Math.round(market_place_tax * 10000));
    }
    if (cashback_tax !== undefined) {
      partnerConfig.changeCashbackTax(Math.round(cashback_tax * 10000));
    }

    await this.repository.update(partnerConfig);

    // 4. Invalidação de Contrato
    // Sempre deletamos o contrato atual para forçar uma nova assinatura com as novas taxas.
    // Não deletamos o contrato anterior (Gatilho Diferido). Ele continua válido até que o novo seja assinado.
    // Geramos o novo contrato PENDING com as taxas pendentes
    await this.generateContractUsecase.execute({ business_info_uuid });

    // Se o parceiro estava aguardando pagamento, ele precisa assinar novamente o contrato (volta para pending_contract).
    // Se ele for active ou pending_approval, NÃO alteramos o status para não travar a operação dele.
    if (business.status === 'awaiting_payment') {
      await this.businessInfoRepository.updateStatus(business_info_uuid, BusinessStatus.pending_contract);
    }
  }
}
