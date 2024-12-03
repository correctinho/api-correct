import { Request, Response } from 'express';
import { IBranchRepository } from '../../repositories/branch.repository';
import { GetAvailableBranchesByAppUserUsecase } from './get-available-branches-by-app-user.usecase';

export class GetAvailableBranchesByAppUserController {
    constructor(private branchRepository: IBranchRepository) {}

    async handle(req: Request, res: Response) {
        try {
            const getListBranchUsecase = new GetAvailableBranchesByAppUserUsecase(
                this.branchRepository
            );

            const resp = await getListBranchUsecase.execute();

            return res.json(resp);
        } catch (err: any) {
            return res.status(err.statusCode).json({
                error: err.message,
            });
        }
    }
}
