import { Request, Response } from 'express';
import { ListMySubscriptionsUseCase } from './list-my-subscriptions.usecase';

export class ListMySubscriptionsController {
    constructor(private usecase: ListMySubscriptionsUseCase) {}

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            const userUuid = request.appUser.user_info_uuid;
            
            if (!userUuid) {
                return response.status(400).json({ error: "User Info not found." });
            }
            
            const result = await this.usecase.execute(userUuid);
            
            return response.status(200).json(result);
        } catch (error: any) {
            return response.status(400).json({
                error: error.message || 'Unexpected error'
            });
        }
    }
}
