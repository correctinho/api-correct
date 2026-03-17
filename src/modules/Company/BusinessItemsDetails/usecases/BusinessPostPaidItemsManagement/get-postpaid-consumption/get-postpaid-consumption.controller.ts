import { Request, Response } from "express";
import { GetPostpaidConsumptionUsecase } from "./get-postpaid-consumption.usecase";
import { ITransactionOrderRepository } from "../../../../../Payments/Transactions/repositories/transaction-order.repository";
import { IBusinessItemDetailsRepository } from "../../../repositories/business-item-details.repository";

export class GetPostpaidConsumptionController {
 constructor(
        private transactionOrderRepository: ITransactionOrderRepository,
        private businessItemDetailsRepository: IBusinessItemDetailsRepository
    ) {}

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            // Pega o ID do benefício pela rota (/business/item/:uuid/...)
            const employer_item_details_uuid = request.params.employer_item_details_uuid;
            const business_info_uuid = request.companyUser.businessInfoUuid; // ID da empresa do token de autenticação

            // Pega as datas da query string (?start_date=2026-02-20&end_date=2026-03-19)
            const start_date = request.query.start_date as string;
            const end_date = request.query.end_date as string;

            // Validação básica de entrada
            if (!start_date || !end_date) {
                return response.status(400).json({
                    error: "Os parâmetros start_date e end_date são obrigatórios na URL."
                });
            }

            const usecase = new GetPostpaidConsumptionUsecase(this.transactionOrderRepository, this.businessItemDetailsRepository);
            // Executa a regra de negócio
            const result = await usecase.execute({
                employer_item_details_uuid,
                start_date,
                end_date,
                business_info_uuid
              });

            // Retorna o array de colaboradores e o total do ciclo
            return response.status(200).json(result);

        } catch (error: any) {
            // Tratamento de erro padrão da sua aplicação (ajuste conforme seu middleware/CustomError)
            return response.status(error.statusCode || 500).json({
                error: error.message || "Erro interno ao buscar consumo pós-pago."
            });
        }
    }
}
