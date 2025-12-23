import { Request, Response } from 'express';
import { ITermsOfServiceRepository } from '../../repositories/terms-of-service.repository';
import { CustomError } from '../../../../errors/custom.error';
import { TermsTypeEnum } from '../../entities/enums/terms-type.enum';
import { GetActiveTermsByTypeUsecase } from './get-active-terms.usecase';

export class GetActiveTermsByTypeController {
    constructor(private readonly termsRepository: ITermsOfServiceRepository) {}

    async handle(req: Request, res: Response) {
        try {
            // 1. Extração de dados da Requisição HTTP
            // Assumimos que a rota será algo como: GET /terms/active/:type
            const { type } = req.params;

            console.log(
                `[GetActiveTermsController] Recebida solicitação para tipo: ${type}`
            );

            // Pequena validação prévia (opcional, o usecase já faz, mas ajuda no log)
            // Fazemos um cast para o Enum para satisfazer o TypeScript
            const termsTypeEnum = type as TermsTypeEnum;

            // 2. Chamada do UseCase
            const useCase = new GetActiveTermsByTypeUsecase(this.termsRepository)
            const result = await useCase.execute({type: termsTypeEnum})

            // 3. Resposta HTTP de Sucesso (200 OK)
            return res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof CustomError) {
                return res
                    .status(error.statusCode)
                    .json({ error: error.message });
            }
            console.error(
                'Unexpected error in CancelPOSTransactionController:',
                error
            );
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
