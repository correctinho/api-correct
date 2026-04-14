import { IBranchRepository } from '../../repositories/branch.repository';
import { IBenefitsRepository } from '../../../benefits/repositories/benefit.repository';
import { InputCreateBranchDTO } from './dto/create-branch.dto';
import { BranchEntity } from '../../entities/branch.entity';
import { CustomError } from '../../../../errors/custom.error';

export class CreateBranchUsecase {
  constructor(
    private branchRepository: IBranchRepository,
    private benefitsRepository: IBenefitsRepository
  ) { }

  async execute(data: InputCreateBranchDTO[]): Promise<BranchEntity[]> {
    const branches: BranchEntity[] = [];
    const correctUuid = process.env.CORRECT_ITEM_UUID;

    for (const branchData of data) {
      // 1. Criamos a entidade primeiro
      const branchEntity = BranchEntity.create(branchData);

      // 2. Verificamos se o nome já existe
      const existingBranch = await this.branchRepository.findByName(branchEntity.name);
      if (existingBranch) {
        throw new CustomError(`Ramo "${branchEntity.name}" já registrado`, 409);
      }

      // 3. Resolvemos os UUIDs dos benefícios (usando um Set para garantir unicidade)
      const uniqueUuids = new Set<string>();

      // Adicionamos os UUIDs que vierem por nome no catálogo
      if (branchData.benefits_name && branchData.benefits_name.length > 0) {
        for (const name of branchData.benefits_name) {
          const findItem = await this.benefitsRepository.findByName(name);
          if (!findItem) {
            throw new CustomError(`Produto "${name}" não encontrado`, 404);
          }
          uniqueUuids.add(findItem.uuid.uuid);
        }
      }

      // 4. Garantimos o benefício Correct via .env
      if (correctUuid) {
        uniqueUuids.add(correctUuid);
      }

      // 5. Injetamos a lista final na entidade usando o método de alteração
      branchEntity.changeBenefitsUuid(Array.from(uniqueUuids));

      // 6. Salvamos no repositório
      const branchCreated = await this.branchRepository.create(branchEntity);
      branches.push(branchCreated);
    }

    return branches;
  }
}