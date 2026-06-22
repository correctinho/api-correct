import { Request, Response } from "express";
import { QuoteCartFreightUseCase } from "./quote-cart-freight.usecase";

export class QuoteCartFreightController {
    // Injeção de dependência via construtor
    constructor(private useCase: QuoteCartFreightUseCase) { }

    async handle(req: Request, res: Response) {
        try {
            const { uuid } = req.params;
            const { destination_lat, destination_lng, destination_address } = req.body;

            const result = await this.useCase.execute({
                cart_uuid: uuid,
                destination_lat,
                destination_lng,
                destination_address
            });

            return res.json(result);
        } catch (error: any) {
            const statusCode = error.message.includes("not found") ? 404 : 400;
            return res.status(statusCode).json({ error: error.message });
        }
    }
}