import { CustomError } from "../../../../errors/custom.error";
import { IBusinessContractRepository } from "../../repositories/business-contract.repository";
import { InputGenerateBusinessContractDTO, OutputGenerateBusinessContractDTO } from "./dto/generate-business-contract.dto";

export class GenerateBusinessContractUsecase {
    constructor(
        private readonly repository: IBusinessContractRepository
    ) { }

    async execute(input: InputGenerateBusinessContractDTO): Promise<OutputGenerateBusinessContractDTO> {
        // 1. Busca os dados da empresa e as taxas que ela vai pagar
        const businessData = await this.repository.getBusinessData(input.business_info_uuid);
        if (!businessData) {
            throw new CustomError("Empresa não encontrada para geração de contrato.", 404);
        }

        // 2. Busca o template do contrato global (B2B_BUSINESS_MSA)
        const activeTerm = await this.repository.getActiveB2BTerm();
        if (!activeTerm) {
            throw new CustomError("Nenhum Termo de Serviço base ativo encontrado para B2B.", 500);
        }

        // 3. O motor de renderização (Template Interpolation)
        // Aqui trocamos as tags {{NOME}} no HTML pelos dados reais vindos do banco
        let renderedHtml = activeTerm.content;

        renderedHtml = renderedHtml.replace(/{{RAZAO_SOCIAL}}/g, businessData.corporate_reason || '');
        renderedHtml = renderedHtml.replace(/{{NOME_FANTASIA}}/g, businessData.fantasy_name || '');
        renderedHtml = renderedHtml.replace(/{{CNPJ}}/g, businessData.document || '');
        renderedHtml = renderedHtml.replace(/{{TAXA_ADM}}/g, businessData.admin_tax.toString());
        renderedHtml = renderedHtml.replace(/{{TAXA_MKT}}/g, businessData.marketing_tax.toString());
        renderedHtml = renderedHtml.replace(/{{TAXA_MKT_PLACE}}/g, businessData.market_place_tax.toString());

        // Adiciona a data atual de geração
        const today = new Date().toLocaleDateString('pt-BR');
        renderedHtml = renderedHtml.replace(/{{DATA_GERACAO}}/g, today);

        // 4. Salva o rascunho na nova tabela como PENDING
        const contract = await this.repository.savePendingContract({
            business_info_uuid: businessData.uuid,
            terms_uuid: activeTerm.uuid,
            rendered_html: renderedHtml,
            status: 'PENDING'
        });

        return {
            uuid: contract.uuid,
            status: contract.status
        };
    }
}