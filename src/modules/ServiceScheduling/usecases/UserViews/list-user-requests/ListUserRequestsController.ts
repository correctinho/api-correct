import { Request, Response } from 'express';
// Import das Interfaces (Abstrações)
import { ICompanyDataRepository } from '../../../../Company/CompanyData/repositories/company-data.repository';
import { IProductRepository } from '../../../../Ecommerce/Products/repositories/product.repository';
// Import do UseCase
import { ListUserRequestsUsecase } from './ListUserRequestsUsecase';
import { IServiceRequestRepository } from '../../../repositories/IServiceRequestRepository';

export class ListUserRequestsController {
    // Injeção de dependências via construtor
    constructor(
        private serviceRequestRepository: IServiceRequestRepository,
        private companyDataRepository: ICompanyDataRepository,
        private productsRepository: IProductRepository
    ) {}

    async handle(request: Request, response: Response): Promise<Response> {
        // 1. Extrair o ID do usuário logado do token
        // O middleware appUserIsAuth deve popular isso. Ajuste se o nome do campo for diferente.
        const userUuidStr = request.appUser.user_info_uuid

        // Validação de segurança básica
        if (!userUuidStr) {
            return response.status(403).json({
                error: "Acesso negado. Usuário não identificado."
            });
        }

        // 2. Instanciar o UseCase com as dependências injetadas
        const usecase = new ListUserRequestsUsecase(
            this.serviceRequestRepository,
            this.companyDataRepository,
            this.productsRepository
        );

        // 3. Executar a lógica
        try {
            const output = await usecase.execute(userUuidStr);
            // Retorna 200 OK com a lista (mesmo que vazia)
            return response.status(200).json(output);
        } catch (error: any) {
            // Tratamento de erro padrão
            const statusCode = error.statusCode || 500;
            return response.status(statusCode).json({
                error: error.message || "Erro interno ao buscar seus agendamentos."
            });
        }
    }
}