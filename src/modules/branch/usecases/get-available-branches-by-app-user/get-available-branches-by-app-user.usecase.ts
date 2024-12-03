import { IBranchRepository } from '../../repositories/branch.repository';

export class GetAvailableBranchesByAppUserUsecase {
    constructor(private branchRepository: IBranchRepository) {}

    async execute() {
        const branches = await this.branchRepository.getAvailableBranches();

        return branches.map(branch => ({
          uuid: branch.uuid,
          name: branch.name,
          image: `/images/svg/${branch.name.toLocaleLowerCase()}.svg`
        }))
    }
}
