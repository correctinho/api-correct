import { Request, Response } from 'express';
import { ListProviderScheduledRequestsUsecase } from './ListProviderScheduledRequestsUsecase';
import { IServiceRequestRepository } from '../../../repositories/IServiceRequestRepository';
import { IConfirmedAppointmentRepository } from '../../../repositories/IConfirmedAppointmentRepository';
import { IAppUserInfoRepository } from '../../../../AppUser/AppUserManagement/repositories/app-user-info.repository';
import { IProductRepository } from '../../../../Ecommerce/Products/repositories/product.repository';

export class ListProviderScheduledRequestsController {
    // Injeção de dependências via construtor
    constructor(
        private serviceRequestRepository: IServiceRequestRepository,
        private confirmedAppointmentRepository: IConfirmedAppointmentRepository,
        private userInfoRepository: IAppUserInfoRepository,
        private productsRepository: IProductRepository
    ) {}

    async handle(request: Request, response: Response): Promise<Response> {
        // 1. Extrair o ID da empresa do token de autenticação do prestador
        // O middleware companyIsAuth popula request.companyUser
        const businessInfoUuidStr = request.companyUser?.businessInfoUuid;

        // Validação de segurança básica
        if (!businessInfoUuidStr) {
            return response.status(403).json({
                error: "Acesso negado. Funcionalidade exclusiva para prestadores autenticados."
            });
        }

        // 2. Instanciar o UseCase com as dependências injetadas
        const usecase = new ListProviderScheduledRequestsUsecase(
            this.serviceRequestRepository,
            this.confirmedAppointmentRepository,
            this.userInfoRepository,
            this.productsRepository
        );

        // 3. Executar a lógica
        try {
            const output = await usecase.execute(businessInfoUuidStr);
            // Retorna 200 OK com a lista (mesmo que vazia)
            return response.status(200).json(output);
        } catch (error: any) {
            // Tratamento de erro padrão
            const statusCode = error.statusCode || 500;
            // Em produção, você logaria o erro real aqui antes de retornar a mensagem genérica
            console.error(error);
            return response.status(statusCode).json({
                error: error.message || "Erro interno ao buscar a agenda confirmada."
            });
        }
    }
}