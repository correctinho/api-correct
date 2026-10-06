import { Request, Response } from "express";
import { ListMassRegistrationsUseCase } from "./list-mass-registrations.usecase";

export class ListMassRegistrationsController {
    async handle(request: Request, response: Response): Promise<Response> {
        try {
            const useCase = new ListMassRegistrationsUseCase();
            const result = await useCase.execute();
            return response.status(200).json(result);
        } catch (err: any) {
            return response.status(err.statusCode || 500).json({
                message: err.message || "Erro inesperado ao buscar solicitações"
            });
        }
    }
}
