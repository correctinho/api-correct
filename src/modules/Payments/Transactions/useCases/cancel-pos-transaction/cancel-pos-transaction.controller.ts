import { Request, Response } from 'express';
import { CustomError } from '../../../../../errors/custom.error';
import { InputCancelPOSTransactionDTO } from './dto/cancel-pos-transaction.dto';
import { CancelPOSTransactionUsecase } from './cancel-pos-transaction.usecase';

export class CancelPOSTransactionController {
  constructor(
    private cancelPOSTransactionUsecase: CancelPOSTransactionUsecase
  ) {}

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      // 1. Extrair dados da requisição
      const { transaction_uuid } = request.params;

      // Assumindo que o middleware de autenticação de parceiro (companyIsAuth)
      // popula o request.companyUser com os dados do usuário logado.
      const partner_user_uuid = request.companyUser?.companyUserId;

      if (!transaction_uuid) {
        throw new CustomError("Transaction UUID is required in url params.", 400);
      }

      if (!partner_user_uuid) {
        // Isso não deveria acontecer se o middleware de auth estiver funcionando corretamente
        throw new CustomError("Authenticated partner user not found.", 401);
      }

      const input: InputCancelPOSTransactionDTO = {
        transaction_uuid,
        partner_user_uuid
      };

      // 2. Executar o Use Case
      const output = await this.cancelPOSTransactionUsecase.execute(input);

      // 3. Retornar sucesso
      return response.status(200).json(output);

    } catch (error: any) {
      // Tratamento de erro padrão
      if (error instanceof CustomError) {
        return response.status(error.statusCode).json({ error: error.message });
      }
      console.error("Unexpected error in CancelPOSTransactionController:", error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  }
}