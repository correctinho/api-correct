import { IBenefitsRepository } from "../../repositories/benefit.repository";
import { OutputListProgramsDto } from "./list-programs.dto";

export class ListProgramsByAudienceUseCase {
  constructor(private benefitRepository: IBenefitsRepository) {}

  async execute(payerType: 'USER' | 'EMPLOYER'): Promise<OutputListProgramsDto> {
    const programs = await this.benefitRepository.findProgramsByPayerType(payerType);

    return {
      programs: programs.map(program => ({
        uuid: program.uuid.uuid,
        name: program.name,
        description: program.description,
        img_url: program.img_url || null
      }))
    };
  }
}
