import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { IProductRepository } from "../../../../Ecommerce/Products/repositories/product.repository";
import { IServiceRequestRepository } from "../../../repositories/IServiceRequestRepository";
import { OutputListProviderPendingRequestsDto, PendingRequestItemDto } from "./dto/ListProviderPendingRequests.dto";

export class ListProviderPendingRequestsUsecase {
    constructor(
        // Injetamos apenas o repositório de requests, pois ele já está
        // configurado para trazer os dados de usuário e produto juntos.
        private serviceRequestRepository: IServiceRequestRepository,
        private userInfoRepository: IAppUserInfoRepository,
        private productsRepository: IProductRepository
    ) {}

    async execute(businessInfoUuidStr: string): Promise<OutputListProviderPendingRequestsDto> {
        const businessUuid = new Uuid(businessInfoUuidStr);

        // 1. Buscar as entidades principais
        const pendingRequestsEntities = await this.serviceRequestRepository.findPendingByBusiness(businessUuid);

        // 2. Mapear e ENRIQUECER os dados
        // Usamos Promise.all para buscar os nomes em paralelo para cada request
        const mappedRequests: PendingRequestItemDto[] = await Promise.all(
            pendingRequestsEntities.map(async (entity) => {
                // Buscamos os dados "estrangeiros"
                // Usamos Promise.all novamente para buscar usuário e produto em paralelo
                const [userInfo, product] = await Promise.all([
                    this.userInfoRepository.find(entity.userInfoUuid),
                    this.productsRepository.find(entity.productUuid)
                ]);

                // Montamos o DTO com os nomes reais, ou um fallback se algo der muito errado
                return {
                    request_uuid: entity.uuid.uuid,
                    created_at: entity.createdAt,
                    customer: {
                        uuid: entity.userInfoUuid.uuid,
                        name: userInfo ? userInfo.full_name : "Cliente Desconhecido" // Ajuste para o campo correto do seu UserInfo
                    },
                    service: {
                        uuid: entity.productUuid.uuid,
                        name: product ? product.name : "Serviço Desconhecido" // Ajuste para o campo correto do seu Product
                    },
                    requested_windows: entity.requestedWindows.map(window => ({
                        date: window.date.toISOString().split('T')[0],
                        period: window.period
                    }))
                };
            })
        );

        return {
            requests: mappedRequests
        };
    }
}