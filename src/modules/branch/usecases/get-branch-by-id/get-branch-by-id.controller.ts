import { Request, Response } from 'express';
import { IBranchRepository } from '../../repositories/branch.repository';
import { GetBranchByIDUsecase } from './get-branch-by-id.usecase';

export class GetBranchByIDController {
    constructor(private branchRepository: IBranchRepository) {}

    async handle(req: Request, res: Response) {
        try {
            const getBranchByIDUsecase = new GetBranchByIDUsecase(
                this.branchRepository
            );
            const uuid = req.params.uuid as string

            const resp = await getBranchByIDUsecase.execute(uuid);

            return res.json(resp);
        } catch (err: any) {
            return res.status(err.statusCode).json({
                error: err.message,
            });
        }
    }
}
