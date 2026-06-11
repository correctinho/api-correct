import { Request, Response } from 'express';
import { CustomError } from '../../../../../errors/custom.error';
import { ListSubscriptionPlansUseCase } from './list-subscription-plans.usecase';

export class ListSubscriptionPlansController {
    constructor(private readonly usecase: ListSubscriptionPlansUseCase) { }

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            const { item_uuid } = request.query;

            if (!item_uuid) {
                throw new CustomError('item_uuid is required in query parameters.', 400);
            }
            const output = await this.usecase.execute(item_uuid as string);
            return response.status(200).json(output);
        } catch (err: any) {
            const statusCode = err instanceof CustomError ? err.statusCode : 500;
            return response.status(statusCode).json({
                error: err.message || "Internal Server Error",
            });
        }
    }
}
