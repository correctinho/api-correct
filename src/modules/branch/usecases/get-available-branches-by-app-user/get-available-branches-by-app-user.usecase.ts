import { IBranchRepository } from '../../repositories/branch.repository';
import { OutputGetAvailableBranches } from './dto/get-available-branches.dto';

export class GetAvailableBranchesByAppUserUsecase {
    constructor(private branchRepository: IBranchRepository) {}

    async execute(): Promise<OutputGetAvailableBranches> {
        const branches = await this.branchRepository.getAvailableBranches();

        return branches.map(branch => ({
          uuid: branch.uuid,
          name: branch.name,
          image: `/images/svg/${branch.name.toLocaleLowerCase()}.svg`
        }))
    }
}
