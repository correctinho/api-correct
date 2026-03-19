import { Request, Response } from "express";
import { PostpaidRolloverUsecase } from "./postpaid-rollover.usecase";
import { ITransactionOrderRepository } from "../../../../../Payments/Transactions/repositories/transaction-order.repository";

export class PostpaidRolloverController {
    constructor(
        private transactionOrderRepository: ITransactionOrderRepository
    ) {}

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            // Como é um Webhook (POST), pegamos o ID do body enviado pelo n8n
            const { employer_item_details_uuid } = request.body;
            console.log("Recebido webhook de virada de ciclo do pós-pago para employer_item_details_uuid:", employer_item_details_uuid);
            if (!employer_item_details_uuid) {
                return response.status(400).json({
                    error: "O campo 'employer_item_details_uuid' é obrigatório no corpo da requisição."
                });
            }

            // Instancia o UseCase injetando o repositório, seguindo o seu padrão
            const usecase = new PostpaidRolloverUsecase(this.transactionOrderRepository);

            // Executa a virada de ciclo
            const result = await usecase.execute({
                employer_item_details_uuid
            });

            // Retorna o sucesso e a quantidade de usuários atualizados para o n8n registrar o log
            return response.status(200).json(result);

        } catch (error: any) {
            return response.status(error.statusCode || 500).json({
                error: error.message || "Erro interno ao processar a virada de ciclo do pós-pago."
            });
        }
    }
}
