import { Request, Response } from "express";
import { GenerateOnboardingPixUseCase } from "./generate-onboarding-pix.usecase";

export class GenerateOnboardingPixController {
    constructor(private useCase: GenerateOnboardingPixUseCase) { }

    async handle(req: Request, res: Response): Promise<Response> {
        try {
            const { uuid } = req.params;
            const result = await this.useCase.execute({ business_info_uuid: uuid });
            return res.status(201).json(result);
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }
}
