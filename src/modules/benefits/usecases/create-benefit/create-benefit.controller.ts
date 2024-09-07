import { Request, Response } from 'express';
import { IBenefitsRepository } from '../../repositories/benefit.repository';
import { CreateBenefitUsecase } from './create-benefit.usecase';

export class CreateBenefitController {
    constructor(
      private BenefitsRepository: IBenefitsRepository,

    ) {}

    async handle(req: Request, res: Response) {
        try {
            const createBenefitUsecase = new CreateBenefitUsecase(
                this.BenefitsRepository,
            );
            const data = req.body;

            const resp = await createBenefitUsecase.execute(data);

            return res.status(201).json(resp);
        } catch (err: any) {
            return res.status(err.statusCode).json({
                error: err.message,
            });
        }
    }
}
