import { CustomError } from '../../../../errors/custom.error';
import { IBranchRepository } from '../../repositories/branch.repository';

export class GetBranchByIDUsecase {
  constructor(private branchRepository: IBranchRepository) { }

  async execute(uuid: string) {
    if (!uuid) {
      throw new CustomError("Branch uuid is required", 400)
    }
    const branch = await this.branchRepository.getByID(uuid);
    if (!branch) throw new CustomError('Branch not found', 404);

    return branch;
  }
}
