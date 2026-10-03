import { IBusinessClubRepository } from "../../../repositories/business-club.repository";

export class GetProgramBranchesUseCase {
  constructor(private businessClubRepository: IBusinessClubRepository) { }

  async execute(program_uuid: string) {
    if (!program_uuid) {
      throw new Error('O ID do programa é obrigatório.');
    }
    const branches = await this.businessClubRepository.getProgramBranches(program_uuid);
    return branches;
  }
}
