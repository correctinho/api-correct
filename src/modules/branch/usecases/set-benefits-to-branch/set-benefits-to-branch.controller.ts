import { Request, Response } from 'express';
import { SetBenefitsToBranchUsecase } from './set-benefits-to-branch.usecase';
import { IBranchRepository } from '../../repositories/branch.repository';
import { IBenefitsRepository } from '../../../benefits/repositories/benefit.repository';

export class SetBenefitsToBranchController {
  constructor(
    private branchRepository: IBranchRepository,
    private benefitsRepository: IBenefitsRepository
  ) {}

  async handle(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const { benefits_uuids } = req.body;

      const usecase = new SetBenefitsToBranchUsecase(
        this.branchRepository,
        this.benefitsRepository
      );

      await usecase.execute({
        branch_uuid: uuid,
        benefits_uuids,
      });

      return res.status(204).send();
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        error: err.message || 'Internal Server Error',
      });
    }
  }
}
