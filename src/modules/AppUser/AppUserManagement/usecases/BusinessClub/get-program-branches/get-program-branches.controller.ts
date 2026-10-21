import { Request, Response } from 'express';
import { GetProgramBranchesUseCase } from './get-program-branches.usecase';

export class GetProgramBranchesController {
  constructor(private getProgramBranchesUseCase: GetProgramBranchesUseCase) {}

  async handle(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const branches = await this.getProgramBranchesUseCase.execute(uuid);
      return res.json(branches);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Erro inesperado.' });
    }
  }
}
