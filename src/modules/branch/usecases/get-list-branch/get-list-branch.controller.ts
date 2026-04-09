import { Request, Response } from 'express';
import { IBranchRepository } from '../../repositories/branch.repository';
import { GetListBranchUsecase } from './get-list-branch.usecase';

export class GetListBranchController {
    constructor(private branchRepository: IBranchRepository) { }

    async handle(req: Request, res: Response) {
        try {
            const getListBranchUsecase = new GetListBranchUsecase(
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
