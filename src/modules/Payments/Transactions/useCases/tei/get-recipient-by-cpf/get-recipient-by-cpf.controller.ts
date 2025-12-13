import { Request, Response } from 'express';
import { GetRecipientByCpfUsecase } from './get-recipient-by-cpf.usecase';
import { IAppUserInfoRepository } from '../../../../../AppUser/AppUserManagement/repositories/app-user-info.repository';

export class GetRecipientByCpfController {
    constructor(private userInfoRepository: IAppUserInfoRepository) {}

    async handle(request: Request, response: Response): Promise<Response> {
        // O CPF vem na URL (ex: /tei/recipient/12345678900)
        const { cpf } = request.params;

        try {
            const payerUserInfoUuid = request.appUser.user_info_uuid;

            if (!payerUserInfoUuid) {
                return response
                    .status(401)
                    .json({ error: 'Usuário não autenticado.' });
            }
            const useCase = new GetRecipientByCpfUsecase(
                this.userInfoRepository
            );

            const recipientData = await useCase.execute({
                cpf,
                payerUserInfoUuid,
            });

            return response.json(recipientData);
        } catch (err: any) {
            const statusCode = err.statusCode || 500; // Default para 500 se não houver statusCode
            return response.status(statusCode).json({
                error: err.message || 'Internal Server Error', // Mensagem padrão
            });
        }
    }
}
 