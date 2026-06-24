import { Request, Response } from "express";
import { QuoteCartFreightUseCase } from "./quote-cart-freight.usecase";

export class QuoteCartFreightController {
    constructor(private useCase: QuoteCartFreightUseCase) { }

    async handle(req: Request, res: Response) {
        try {
            const { uuid } = req.params;

            const {
                destination_lat,
                destination_lng,
                destination_street,
                destination_number,
                destination_complement,
                destination_neighborhood,
                destination_cep
            } = req.body;

            const result = await this.useCase.execute({
                cart_uuid: uuid,
                destination_lat,
                destination_lng,
                destination_street,
                destination_number,
                destination_complement,
                destination_neighborhood,
                destination_cep
            });
            return res.json(result);
        } catch (error: any) {
            const statusCode = error.message.includes("não encontrado") ? 404 : 400;
            return res.status(statusCode).json({ error: error.message });
        }
    }
}