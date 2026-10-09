
import { Request, Response } from "express";
import { UpdateUserItemLimitUsecase } from "./update-user-item-limit.usecase";

export class UpdateUserItemLimitController {
    constructor(private usecase: UpdateUserItemLimitUsecase) { }

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            const { user_item_uuid, new_limit } = request.body;
            const business_info_uuid = request.companyUser.businessInfoUuid;

            await this.usecase.execute({
                user_item_uuid,
                business_info_uuid,
                new_limit
            });

            return response.status(200).json({ message: "Limite atualizado com sucesso." });
        } catch (error: any) {
            return response.status(error.statusCode || 500).json({ error: error.message });
        }
    }
}
