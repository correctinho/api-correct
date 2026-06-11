import { Request, Response } from 'express';
import { CustomError } from '../../../../../errors/custom.error';
import { UpdateSubscriptionPlanUseCase } from './update-subscription-plan.usecase';

export class UpdateSubscriptionPlanController {
    constructor(private readonly usecase: UpdateSubscriptionPlanUseCase) {}

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            const { uuid } = request.params;
            const { name, description, is_active } = request.body;

            if (!uuid) {
                throw new CustomError('UUID is required in parameters.', 400);
            }

            const output = await this.usecase.execute({
                uuid,
                name,
                description,
                is_active
            });

            return response.status(200).json(output);
        } catch (err: any) {
            const statusCode = err instanceof CustomError ? err.statusCode : 500;
            return response.status(statusCode).json({
                error: err.message || "Internal Server Error",
            });
        }
    }
}
