import { Request, Response } from "express";
import { GetAddressFromCoordsUseCase } from "./get-address-from-coords.usecase";

export class GetAddressFromCoordsController {
    constructor(private useCase: GetAddressFromCoordsUseCase) {}

    async handle(req: Request, res: Response) {
        try {
            const lat = Number(req.query.lat);
            const lng = Number(req.query.lng);

            if (isNaN(lat) || isNaN(lng)) {
                return res.status(400).json({ error: "Invalid coordinates provided." });
            }

            const result = await this.useCase.execute({ lat, lng });

            return res.json(result);
        } catch (error: any) {
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({ error: error.message });
        }
    }
}
