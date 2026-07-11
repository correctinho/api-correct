import { Request, Response } from "express";
import { CheckBusinessStatusUseCase } from "./check-business-status.usecase";

export class CheckBusinessStatusController {
    constructor(private checkBusinessStatusUseCase: CheckBusinessStatusUseCase) { }

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            const { document } = request.params;

            const result = await this.checkBusinessStatusUseCase.execute(document);
            console.log(result)

            return response.status(200).json(result);
        } catch (error: any) {
            return response.status(error.statusCode || 500).json({ error: error.message });
        }
    }
}
