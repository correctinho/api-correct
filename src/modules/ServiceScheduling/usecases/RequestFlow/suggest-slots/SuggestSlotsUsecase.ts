import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { INotifierProvider } from "../../../../../infra/providers/NotifierProvider/INotifierProvider";
import { IServiceRequestRepository } from "../../../repositories/IServiceRequestRepository";
import { InputSuggestSlotsDto } from "./dto/SuggestSlots.dto";

export class SuggestSlotsUsecase {
    constructor(
        // Injeção de dependências via interface
        private serviceRequestRepository: IServiceRequestRepository,
        private notifier: INotifierProvider
    ) {}

    async execute(input: InputSuggestSlotsDto): Promise<void> {
        // 1. Validações Iniciais
        if (!input.suggested_slots || input.suggested_slots.length === 0) {
            throw new CustomError("É necessário sugerir pelo menos um horário.", 400);
        }

        const requestUuid = new Uuid(input.request_uuid);
        // O ID da empresa que está tentando realizar a ação (vem do token)
        const attemptingBusinessUuidStr = input.business_info_uuid;

        // 2. Buscar a solicitação no banco
        const serviceRequestEntity = await this.serviceRequestRepository.find(requestUuid);

        if (!serviceRequestEntity) {
            throw new CustomError("Solicitação de serviço não encontrada.", 404);
        }

        // 3. SEGURANÇA CRÍTICA: Verificar a propriedade.
        // A empresa do token DEVE ser a mesma empresa da solicitação.
        // Comparando as strings dos UUIDs.
        if (serviceRequestEntity.businessInfoUuid.uuid !== attemptingBusinessUuidStr) {
            throw new CustomError("Acesso negado. Você não tem permissão para responder a esta solicitação.", 403);
        }

        // 4. Executar a lógica de domínio na entidade
        // (O método suggestSlots da entidade já valida se o status atual permite essa ação)
        const slotsToSuggest = input.suggested_slots.map(s => ({
            startDatetime: new Date(s.start_datetime)
            // O UUID do slot será gerado na persistência se não informado
        }));

        try {
            serviceRequestEntity.suggestSlots(slotsToSuggest);
        } catch (error: any) {
            // Captura erros de domínio (ex: status incorreto) e repassa como Bad Request
            throw new CustomError(error.message, 400);
        }

        // 5. Persistir as mudanças
        // O método update do repositório usará 'upsert' para salvar os novos slots.
        await this.serviceRequestRepository.update(serviceRequestEntity);

        // 6. Notificar o Usuário (via n8n) - Fire and Forget
        // Este evento avisará o usuário que ele precisa entrar no app para escolher um horário.
        this.notifier.notify({
            event_type: 'SERVICE_SLOTS_SUGGESTED',
            data: {
                requestId: serviceRequestEntity.uuid.uuid,
                userId: serviceRequestEntity.userInfoUuid.uuid,
                providerId: serviceRequestEntity.businessInfoUuid.uuid,
                slotsCount: slotsToSuggest.length
            }
        });
    }
}