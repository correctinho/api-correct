import { CustomError } from "../../../../errors/custom.error";
import { TermsTypeEnum } from "../../entities/enums/terms-type.enum";
import { ITermsOfServiceRepository } from "../../repositories/terms-of-service.repository";
import { InputGetActiveTermsDTO, OutputGetActiveTermsDTO } from "./dto/get-active-terms.dto";

export class GetActiveTermsByTypeUsecase {
    constructor(
        private readonly termsRepository: ITermsOfServiceRepository
    ) {}

    async execute(input: InputGetActiveTermsDTO): Promise<OutputGetActiveTermsDTO> {
        // Validação básica da entrada
        if (!input.type || !Object.values(TermsTypeEnum).includes(input.type)) {
            throw new CustomError("Tipo de termo inválido fornecido.", 400);
        }

        console.log(`[GetActiveTerms] Buscando termos ativos do tipo: ${input.type}...`);

        // 1. Busca no repositório
        const activeTermsEntity = await this.termsRepository.findActiveByType(input.type);

        // 2. Validação: É crítico que exista um termo ativo.
        if (!activeTermsEntity) {
            console.error(`[GetActiveTerms] CRÍTICO: Nenhum termo ativo encontrado para o tipo ${input.type}.`);
            // Retorna 404 Not Found, indicando que o recurso necessário não existe no servidor.
            throw new CustomError(`Não há uma versão vigente dos Termos de Uso (${input.type}) disponível no momento. Entre em contato com o suporte.`, 404);
        }

        console.log(`[GetActiveTerms] Versão ativa encontrada: ${activeTermsEntity.version} (UUID: ${activeTermsEntity.uuid.uuid})`);

        // 3. Mapeamento para DTO de saída (protegendo a entidade de domínio)
        return {
            uuid: activeTermsEntity.uuid.uuid,
            version: activeTermsEntity.version,
            content: activeTermsEntity.content,
            // Usamos updatedAt se existir, senão createdAt, como fallback para a data de vigência
            updatedAt: activeTermsEntity.updated_at || activeTermsEntity.created_at!
        };
    }
}