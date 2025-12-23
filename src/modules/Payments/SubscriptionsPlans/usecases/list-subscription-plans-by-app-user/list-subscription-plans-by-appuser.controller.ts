import { Request, Response } from "express";
import { CustomError } from "../../../../../errors/custom.error";
import { ListSubscriptionPlansAppUserUseCase } from "./list-subscription-plans-by-appuser.usecase";
export class ListSubscriptionPlansByAppUserController {
    constructor(private listSubscriptionPlansUseCase: ListSubscriptionPlansAppUserUseCase) { }

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            const userInfoUuid = request.appUser.user_info_uuid;

            if (!userInfoUuid) {
                throw new CustomError("User Info not found.", 400);
            }

            const plansJSON = await this.listSubscriptionPlansUseCase.execute(userInfoUuid);
            return response.status(200).json(plansJSON);
        } catch (err: any) {
            const statusCode = err instanceof CustomError ? err.statusCode : 500;
            return response.status(statusCode).json({
                error: err.message || "Internal Server Error",
            });
        }
    }
}
