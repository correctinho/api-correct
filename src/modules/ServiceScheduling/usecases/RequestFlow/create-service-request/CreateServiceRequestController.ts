import { Request, Response } from 'express';
import { InputCreateServiceRequestDto } from './dto/CreateServiceRequest.dto';
import { ServiceRequestPrismaRepository } from '../../../repositories/implementations/ServiceRequestPrismaRepository';
import { AppUserInfoPrismaRepository } from '../../../../AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository';
import { N8nNotifierProvider } from '../../../../../infra/providers/NotifierProvider/implementations/N8nNotifierProvider';
import { IServiceRequestRepository } from '../../../repositories/IServiceRequestRepository';
import { IProductRepository } from '../../../../Ecommerce/Products/repositories/product.repository';
import { IAppUserInfoRepository } from '../../../../AppUser/AppUserManagement/repositories/app-user-info.repository';
import { INotifierProvider } from '../../../../../infra/providers/NotifierProvider/INotifierProvider';
import { CreateServiceRequestUsecase } from './CreateServiceRequestUsecase';
// Imports dos Repositórios (ajuste os caminhos)

export class CreateServiceRequestController {
    constructor(
            private serviceRequestRepository: IServiceRequestRepository,
            private productsRepository: IProductRepository,
            private userInfoRepository: IAppUserInfoRepository,
            private notifier: INotifierProvider
        ) {}
    async handle(request: Request, response: Response): Promise<Response> {
        // 1. Extrair dados do body e do usuário autenticado
        const { product_uuid, requested_windows } = request.body;
        
        // Assumindo que o middleware de autenticação já populou request.user com o ID do usuário
        const user_info_uuid = request.appUser.user_info_uuid; 

        if (!user_info_uuid) {
            // Segurança extra: se não tiver usuário no request, não deveria ter passado do middleware de auth
            return response.status(401).json({ error: "Usuário não autenticado." });
        }

        const inputDto: InputCreateServiceRequestDto = {
            user_info_uuid,
            product_uuid,
            requested_windows
        };


        // 3. Instanciar o UseCase
        const createServiceRequestUsecase = new CreateServiceRequestUsecase(
            this.serviceRequestRepository,
            this.productsRepository,
            this.userInfoRepository,
            this.notifier
        );

        // 4. Executar a lógica
        try {
            const output = await createServiceRequestUsecase.execute(inputDto);
            return response.status(201).json(output);
        } catch (error: any) {
            // Tratamento de erro básico. Idealmente, você tem um middleware de erro global.
            const statusCode = error.statusCode || 500;
            return response.status(statusCode).json({
                error: error.message || "Erro interno ao criar solicitação de serviço."
            });
        }
    }
}