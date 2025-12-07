import { Request, Response } from 'express';
// Imports dos Repositórios e Cliente Prisma
// Import do UseCase
import { ListProviderPendingRequestsUsecase } from './ListProviderPendingRequestsUsecase';
import { IServiceRequestRepository } from '../../../repositories/IServiceRequestRepository';
import { ServiceRequestPrismaRepository } from '../../../repositories/implementations/ServiceRequestPrismaRepository';
import { IAppUserInfoRepository } from '../../../../AppUser/AppUserManagement/repositories/app-user-info.repository';
import { IProductRepository } from '../../../../Ecommerce/Products/repositories/product.repository';

export class ListProviderPendingRequestsController {
    constructor(
            // Injetamos apenas o repositório de requests, pois ele já está
            // configurado para trazer os dados de usuário e produto juntos.
            private serviceRequestRepository: IServiceRequestRepository,
            private userInfoRepository: IAppUserInfoRepository,
            private productsRepository: IProductRepository
        ) {}
    async handle(request: Request, response: Response): Promise<Response> {
        const businessInfoUuidStr = request.companyUser.businessInfoUuid

        if (!businessInfoUuidStr) {
            return response.status(403).json({
                error: "Acesso negado. Esta funcionalidade é exclusiva para prestadores de serviço."
            });
        }

        // 2. Instanciar as dependências (Injeção Manual)

        // 3. Instanciar o UseCase
        const usecase = new ListProviderPendingRequestsUsecase(
            this.serviceRequestRepository,
            this.userInfoRepository,
            this.productsRepository
        );

        // 4. Executar a lógica
        try {
            const output = await usecase.execute(businessInfoUuidStr);
            return response.status(200).json(output);
        } catch (error: any) {
            // Tratamento de erro básico.
            const statusCode = error.statusCode || 500;
            return response.status(statusCode).json({
                error: error.message || "Erro interno ao buscar solicitações pendentes."
            });
        }
    }
}