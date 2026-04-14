import { CustomError } from '../../../../errors/custom.error';
import { IBranchRepository } from '../../repositories/branch.repository';
import { OutputGetBranchDTO } from './dto/get-branch.dto';

export class GetBranchByIDUsecase {
  constructor(private branchRepository: IBranchRepository) { }

  async execute(uuid: string): Promise<OutputGetBranchDTO> {
    if (!uuid) {
      throw new CustomError("Branch uuid is required", 400)
    }
    const branch = await this.branchRepository.getByID(uuid);
    if (!branch) throw new CustomError('Ramo não encontrado', 404);
    return {
      uuid: branch.uuid,
      name: branch.name,
      marketing_tax: branch.marketing_tax,
      admin_tax: branch.admin_tax,
      market_place_tax: branch.market_place_tax,
      benefits: branch.benefits_uuid.map((id, index) => ({
        uuid: id,
        name: branch.benefits_name[index]
      })),
      created_at: branch.created_at,
      updated_at: branch.updated_at
    }
  }
}
