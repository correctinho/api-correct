import { CustomError } from "../../../../errors/custom.error";
import { IBusinessContractRepository } from "../../repositories/business-contract.repository";
import { InputGenerateBusinessContractDTO, OutputGenerateBusinessContractDTO } from "./dto/generate-business-contract.dto";

export class GenerateBusinessContractUsecase {
    constructor(
        private readonly repository: IBusinessContractRepository
    ) { }

    async execute(input: InputGenerateBusinessContractDTO): Promise<OutputGenerateBusinessContractDTO> {
        const businessData = await this.repository.getBusinessData(input.business_info_uuid);
        if (!businessData) {
            throw new CustomError("Empresa não encontrada para geração de contrato.", 404);
        }

        const activeTerm = await this.repository.getActiveB2BTerm();
        if (!activeTerm) {
            throw new CustomError("Nenhum Termo de Serviço base ativo encontrado para B2B.", 500);
        }

        const Handlebars = require('handlebars');
        const template = Handlebars.compile(activeTerm.content);

        const isPJ = businessData.document.replace(/\D/g, '').length === 14;
        
        const enderecoCompleto = businessData.address 
            ? `${businessData.address.line1}, nº ${businessData.address.line2}, ${businessData.address.neighborhood}, ${businessData.address.city} - ${businessData.address.state}`
            : '';

                        const formatCpfCnpj = (value: string) => {
            const clean = value.replace(/\D/g, '');
            if (clean.length === 11) {
                return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
            } else if (clean.length === 14) {
                return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
            }
            return value;
        };

        const formatTax = (tax: number) => {
            if (!tax || tax === 0) return 'Isento';
            return tax.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + '%';
        };

        const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const dataAtual = new Date();
        const dataExtenso = `Campo Grande - MS, ${dataAtual.getDate()} de ${meses[dataAtual.getMonth()]} de ${dataAtual.getFullYear()}`;

        const renderedHtml = template({
            NUMERO_CONTRATO: businessData.contract_number || businessData.uuid.substring(0, 8).toUpperCase(),
            RAZAO_SOCIAL: businessData.corporate_reason,
            TIPO_DOCUMENTO: isPJ ? 'CNPJ' : 'CPF',
            DOCUMENTO: formatCpfCnpj(businessData.document),
            ENDERECO_COMPLETO: enderecoCompleto,
            IS_PJ: isPJ,
            NOME_RESPONSAVEL: businessData.legal_representative_name || '',
            CPF_RESPONSAVEL: businessData.legal_representative_cpf ? formatCpfCnpj(businessData.legal_representative_cpf) : '',
            
            CHECK_VITRINE: businessData.use_marketing ? 'X' : ' ',
            CHECK_VENDAS_ONLINE: businessData.use_market_place ? 'X' : ' ',
            CHECK_FIDELITY: businessData.use_correct_fidelity ? 'X' : ' ',
            
            DATA_EXTENSO: dataExtenso,
            TAXA_ADESAO: 'R$ 0,00 (Isento)',
            TAXA_ADMINISTRACAO: formatTax(businessData.admin_tax / 10000),
            
            PROGRAMAS: businessData.programs
        });

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
