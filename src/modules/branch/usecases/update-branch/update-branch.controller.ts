import { Request, Response } from 'express';
import { IBranchRepository } from '../../repositories/branch.repository';
import { UpdateBranchUsecase } from './update-branch.usercase';
import { BranchEntity, BranchCreateCommand } from '../../entities/branch.entity';

export class UpdateBranchController {
    constructor(private branchRepository: IBranchRepository) { }

    async handle(req: Request, res: Response) {
        try {
            const updateBranchUsecase = new UpdateBranchUsecase(
                this.branchRepository
            );
            const uuid = req.params.uuid;

            if (!uuid) {
                return res.status(400).json({
                    error: 'Branch uuid is required',
                });
            }

            // Extrai o body e cria UMA ENTIDADE REAL para aplicar o * 10000
            const requestData: BranchCreateCommand = req.body;
            const branchEntity = BranchEntity.create(requestData);

            const resp = await updateBranchUsecase.execute(uuid, branchEntity);

            return res.status(200).json(resp);
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                error: err.message,
            });
        }
    }
}