import { Request, Response } from "express";
import { ListSubscriptionPlansUseCase } from "./list-subscription-plans.usecase";
import { CustomError } from "../../../../../errors/custom.error";

export class ListSubscriptionPlansController {
    constructor(private listSubscriptionPlansUseCase: ListSubscriptionPlansUseCase) { }

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            const plansJSON = await this.listSubscriptionPlansUseCase.execute();
            return response.status(200).json(plansJSON);
        } catch (err: any) {
            const statusCode = err instanceof CustomError ? err.statusCode : 500;
            return response.status(statusCode).json({
                error: err.message || "Internal Server Error",
            });
        }
    }
}
