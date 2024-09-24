import { IBranchRepository } from '../../repositories/branch.repository';
import { CustomError } from '../../../../errors/custom.error';
import { InputCreateBranchDTO } from './dto/create-branch.dto';
import { BranchEntity } from '../../entities/branch.entity';
import { IBenefitsRepository } from '../../../benefits/repositories/benefit.repository';

export class CreateBranchUsecase {
  constructor(
    private branchRepository: IBranchRepository,
    private benefitsRepository: IBenefitsRepository
  ) { }

  async execute(data: InputCreateBranchDTO[]) {
    let branches: BranchEntity[] = []

    for (const branch of data) {
      const branchEntity = BranchEntity.create(branch)
      //check if branch name already exists
      const branchName = await this.branchRepository.findByName(branchEntity.name)
      if (branchName) throw new CustomError("Branch name already registered", 409)

      if (branchEntity.benefits_name.length > 0) {
        for (const item of branchEntity.benefits_name) {

          //find items by name
          const findItem = await this.benefitsRepository.findByName(item)
          if(!findItem) throw new CustomError("Item not found", 404)

          branchEntity.benefits_uuid.push(findItem.uuid.uuid)
        }
      }
      const branchCreated = await this.branchRepository.create(branchEntity);
      branches.push(branchCreated);
    }

    return branches
  }

}
