import { IBranchRepository } from '../../repositories/branch.repository';
import { IBenefitsRepository } from '../../../benefits/repositories/benefit.repository';
import { InputSetBenefitsToBranchDTO } from './set-benefits-to-branch.dto';
import { CustomError } from '../../../../errors/custom.error';

export class SetBenefitsToBranchUsecase {
  constructor(
    private branchRepository: IBranchRepository,
    private benefitsRepository: IBenefitsRepository
  ) { }

  async execute({ branch_uuid, benefits_uuids }: InputSetBenefitsToBranchDTO): Promise<void> {
    const branch = await this.branchRepository.getByID(branch_uuid);

    if (!branch) {
      throw new CustomError('Branch not found', 404);
    }

    const correctUuid = process.env.CORRECT_ITEM_UUID;

    if (!correctUuid) {
      throw new CustomError('Configuração CORRECT_ITEM_UUID não encontrada', 500);
    }

    const uniqueBenefits = new Set(benefits_uuids);
    uniqueBenefits.add(correctUuid);

    await this.branchRepository.syncBenefits(branch_uuid, Array.from(uniqueBenefits));
  }
}
