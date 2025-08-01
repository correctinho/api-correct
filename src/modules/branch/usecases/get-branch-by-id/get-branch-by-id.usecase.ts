import { CustomError } from '../../../../errors/custom.error';
import { IBranchRepository } from '../../repositories/branch.repository';
import { OutputGetBranchDTO } from './dto/get-branch.dto';

export class GetBranchByIDUsecase {
  constructor(private branchRepository: IBranchRepository) { }

  async execute(uuid: string):Promise<OutputGetBranchDTO > {
    if (!uuid) {
      throw new CustomError("Branch uuid is required", 400)
    }
    const branch = await this.branchRepository.getByID(uuid);
    if (!branch) throw new CustomError('Branch not found', 404);

    return {
      uuid: branch.uuid,
      name: branch.name,
      marketing_tax: branch.marketing_tax / 10000,
      admin_tax: branch.admin_tax / 10000,
      market_place_tax: branch.market_place_tax / 10000,
      created_at: branch.created_at,
      updated_at: branch.updated_at
    }
  }
}
