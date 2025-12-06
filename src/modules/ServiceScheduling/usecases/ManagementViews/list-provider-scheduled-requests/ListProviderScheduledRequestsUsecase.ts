import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { IProductRepository } from "../../../../Ecommerce/Products/repositories/product.repository";
import { IConfirmedAppointmentRepository } from "../../../repositories/IConfirmedAppointmentRepository";
import { IServiceRequestRepository } from "../../../repositories/IServiceRequestRepository";
import { OutputListProviderScheduledRequestsDto, ScheduledRequestItemDto } from "./dto/ListProviderScheduledRequests.dto";

export class ListProviderScheduledRequestsUsecase {
    constructor(
        // Injeção das 4 dependências necessárias
        private serviceRequestRepository: IServiceRequestRepository,
        private confirmedAppointmentRepository: IConfirmedAppointmentRepository,
        private userInfoRepository: IAppUserInfoRepository,
        private productsRepository: IProductRepository
    ) {}

    async execute(businessInfoUuidStr: string): Promise<OutputListProviderScheduledRequestsDto> {
        const businessUuid = new Uuid(businessInfoUuidStr);

        // 1. Buscar as solicitações principais (já filtradas por CONFIRMED e ordenadas por data)
        const confirmedRequestsEntities = await this.serviceRequestRepository.findConfirmedByBusiness(businessUuid);

        // 2. Mapear e ENRIQUECER os dados
        const mappedRequests: ScheduledRequestItemDto[] = await Promise.all(
            confirmedRequestsEntities.map(async (requestEntity) => {
                // Buscamos os dados relacionados em paralelo para performance
                const [userInfo, product, confirmedAppointment] = await Promise.all([
                    this.userInfoRepository.find(requestEntity.userInfoUuid),
                    this.productsRepository.find(requestEntity.productUuid),
                    // Busca o agendamento final para pegar a data exata
                    this.confirmedAppointmentRepository.findByRequestId(requestEntity.uuid)
                ]);

                // Validação de consistência (não deveria acontecer se o status é CONFIRMED, mas é bom garantir)
                if (!confirmedAppointment) {
                   throw new CustomError(`Erro de integridade: Solicitação ${requestEntity.uuid.uuid} está confirmada mas não tem agendamento vinculado.`, 500);
                }

                // Monta o DTO do item
                return {
                    request_uuid: requestEntity.uuid.uuid,
                    customer: {
                        uuid: requestEntity.userInfoUuid.uuid,
                        name: userInfo ? userInfo.full_name : "Cliente Desconhecido"
                    },
                    service: {
                        uuid: requestEntity.productUuid.uuid,
                        name: product ? product.name : "Serviço Desconhecido"
                    },
                    // Usa a data final da entidade de agendamento confirmado
                    scheduled_datetime: confirmedAppointment.startDatetime.toISOString()
                };
            })
        );

        return {
            requests: mappedRequests
        };
    }
}