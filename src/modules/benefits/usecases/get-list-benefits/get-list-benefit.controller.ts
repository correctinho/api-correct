import { Request, Response } from 'express';
import { IBenefitsRepository } from '../../repositories/benefit.repository';
import { GetListBenefitUsecase } from './get-list-benefit.usecase';

export class GetListBenefitController {
    constructor(private BenefitsRepository: IBenefitsRepository) { }

    async handle(req: Request, res: Response) {
        try {
            const getListBenefitUsecase = new GetListBenefitUsecase(
                this.BenefitsRepository
            );

            const resp = await getListBenefitUsecase.execute({});
            return res.json(resp);
        } catch (err: any) {
            return res.status(err.statusCode).json({
                error: err.message,
            });
        }
    }
}
