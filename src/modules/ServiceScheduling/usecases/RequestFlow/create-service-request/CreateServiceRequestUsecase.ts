import { IServiceRequestRepository } from "../../../repositories/IServiceRequestRepository";
import { ServiceRequestEntity } from "../../../entities/ServiceRequest.entity";
import { IProductRepository } from "../../../../Ecommerce/Products/repositories/product.repository";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { INotifierProvider } from "../../../../../infra/providers/NotifierProvider/INotifierProvider";
import { InputCreateServiceRequestDto, OutputCreateServiceRequestDto } from "./dto/CreateServiceRequest.dto";
import { CustomError } from "../../../../../errors/custom.error";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";

// IMPORTANTE: Você precisará importar as interfaces dos repositórios de Produto e Usuário
// Ajuste os caminhos conforme sua estrutura real.


export class CreateServiceRequestUsecase {
    constructor(
        private serviceRequestRepository: IServiceRequestRepository,
        // Dependências para validação
        private productsRepository: IProductRepository,
        private userInfoRepository: IAppUserInfoRepository,
        // Dependência para notificação (n8n)
        private notifier: INotifierProvider
    ) {}

    async execute(input: InputCreateServiceRequestDto): Promise<OutputCreateServiceRequestDto> {
        // 1. Validar Inputs Básicos
        if (!input.requested_windows || input.requested_windows.length === 0) {
            throw new CustomError("É necessário informar pelo menos uma janela de preferência.", 400);
        }
        const userUuid = new Uuid(input.user_info_uuid);
        const productUuid = new Uuid(input.product_uuid);

        // 2. Validar Existência do Usuário
        const user = await this.userInfoRepository.find(userUuid);
        if (!user) {
            throw new CustomError("Usuário não encontrado.", 404);
        }

        // 3. Validar Existência do Produto/Serviço e obter o ID da Empresa
        // Precisamos do repositório de produtos para saber a qual empresa esse serviço pertence.
        const product = await this.productsRepository.find(productUuid);
        if (!product) {
            throw new CustomError("Serviço não encontrado.", 404);
        }
        // Validar se product.product_type === 'BOOKABLE_SERVICE'
        if(product.product_type !== "BOOKABLE_SERVICE") throw new CustomError("O produto informado não é um serviço.", 400);

        const businessUuid = product.business_info_uuid; 

        // 4. Converter as janelas do DTO para o formato da Entidade
        const requestedWindowsEntityFormat = input.requested_windows.map(w => ({
            date: new Date(w.date), // Converte string ISO para Date
            period: w.period
        }));

        // 5. Criar a Entidade de Solicitação (Passo 1: Status PENDING_PROVIDER_OPTIONS)
        const newRequest = ServiceRequestEntity.create({
            userInfoUuid: userUuid,
            businessInfoUuid: businessUuid,
            productUuid: productUuid,
            requestedWindows: requestedWindowsEntityFormat
        });

        // 6. Salvar no Repositório (Transacional com as janelas)
        await this.serviceRequestRepository.create(newRequest);

        // 7. Notificar o Prestador (via n8n) - Fire and Forget
        this.notifier.notify({
            event_type: 'NEW_SERVICE_REQUEST_CREATED',
            data: {
                requestId: newRequest.uuid.uuid,
                providerId: businessUuid.uuid,
                userId: userUuid.uuid,
                userName: user.full_name, // Assumindo que a entidade User tem esse getter
                serviceName: product.name, // Assumindo que a entidade Product tem esse getter
                requestedWindows: input.requested_windows
            }
        });

        // 8. Retornar DTO de saída
        return {
            request_uuid: newRequest.uuid.uuid,
            status: newRequest.status,
            created_at: newRequest.toJSON().created_at // Pegando a data gerada na entidade
        };
    }
}