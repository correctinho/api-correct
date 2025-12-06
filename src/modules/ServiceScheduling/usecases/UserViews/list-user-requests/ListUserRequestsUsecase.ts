import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";
import { IProductRepository } from "../../../../Ecommerce/Products/repositories/product.repository";
import { IServiceRequestRepository } from "../../../repositories/IServiceRequestRepository";
import { OutputListUserRequestsDto, UserRequestItemDto } from "./dto/ListUserRequests.dto";

export class ListUserRequestsUsecase {
    constructor(
        private serviceRequestRepository: IServiceRequestRepository,
        // Injeção das dependências para enriquecer os dados
        private companyDataRepository: ICompanyDataRepository, 
        private productsRepository: IProductRepository
    ) {}

    async execute(userUuidStr: string): Promise<OutputListUserRequestsDto> {
        const userUuid = new Uuid(userUuidStr);

        // 1. Buscar as entidades principais
        const userRequestsEntities = await this.serviceRequestRepository.findByUser(userUuid);

        // 2. Mapear e ENRIQUECER os dados
        // Usamos Promise.all para processar cada request em paralelo
        const mappedRequests: UserRequestItemDto[] = await Promise.all(
            userRequestsEntities.map(async (entity) => {
                // Buscamos os dados "estrangeiros" em paralelo
                const [companyData, product] = await Promise.all([
                    // Busca o nome fantasia da empresa
                    this.companyDataRepository.findById(entity.businessInfoUuid.uuid),
                    // Busca o nome do serviço
                    this.productsRepository.find(entity.productUuid)
                ]);

                // Montamos o DTO com os dados reais e fallbacks
                return {
                    request_uuid: entity.uuid.uuid,
                    status: entity.status, // Crucial para o app saber como renderizar o card
                    created_at: entity.createdAt,

                    provider: {
                        uuid: entity.businessInfoUuid.uuid,
                        trade_name: companyData ? companyData.fantasy_name : ""
                    },

                    service: {
                        name: product ? product.name : "Serviço Desconhecido"
                    },

                    // Mapeia as janelas que o usuário pediu
                    requested_windows: entity.requestedWindows.map(window => ({
                        date: window.date.toISOString().split('T')[0],
                        period: window.period
                    })),

                    // Mapeia os slots que o prestador sugeriu (se houver)
                    // Estes slots serão os botões de escolha na tela do usuário
                    suggested_slots: entity.suggestedSlots.map(slot => ({
                        slot_uuid: slot.uuid.uuid, // O ID para confirmar
                        start_datetime: slot.startDatetime.toISOString() // ISO completo para o app formatar
                    }))
                };
            })
        );

        // 3. Retornar a estrutura final do DTO
        return {
            requests: mappedRequests
        };
    }
}