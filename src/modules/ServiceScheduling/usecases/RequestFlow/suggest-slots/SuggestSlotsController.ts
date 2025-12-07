import { Request, Response } from 'express';
// Interfaces Abstratas
import { INotifierProvider } from "../../../../../infra/providers/NotifierProvider/INotifierProvider";
import { IServiceRequestRepository } from "../../../repositories/IServiceRequestRepository";
import { InputSuggestSlotsDto } from "./dto/SuggestSlots.dto";
import { SuggestSlotsUsecase } from './SuggestSlotsUsecase';

export class SuggestSlotsController {
    // Injeção de dependência via construtor com interfaces
    constructor(
        private serviceRequestRepository: IServiceRequestRepository,
        private notifierProvider: INotifierProvider
    ) {}

    async handle(request: Request, response: Response): Promise<Response> {
        // 1. Extrair dados de diferentes fontes (params, body, token user)
        const { requestId } = request.params; // Vem da URL: /:requestId/suggest-slots
        const { suggested_slots } = request.body;
        // O middleware companyIsAuth popula este objeto
        const businessInfoUuidStr = request.companyUser?.businessInfoUuid;

        // Validação básica de segurança do token (redundante se o middleware funcionar, mas bom ter)
        if (!businessInfoUuidStr) {
            return response.status(403).json({
                error: "Acesso negado. Funcionalidade exclusiva para prestadores."
            });
        }

        const inputDto: InputSuggestSlotsDto = {
            request_uuid: requestId,
            business_info_uuid: businessInfoUuidStr,
            suggested_slots: suggested_slots
        };

        // 2. Instanciar o UseCase injetando as dependências recebidas no controller
        const usecase = new SuggestSlotsUsecase(
            this.serviceRequestRepository,
            this.notifierProvider
        );

        // 3. Executar
        try {
            await usecase.execute(inputDto);
            // Retorna 200 OK (sem conteúdo no body, pois é um update bem-sucedido)
            return response.status(200).send();
        } catch (error: any) {
            const statusCode = error.statusCode || 500;
            return response.status(statusCode).json({
                error: error.message || "Erro interno ao sugerir horários."
            });
        }
    }
}