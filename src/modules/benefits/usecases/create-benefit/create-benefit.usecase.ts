import { IBenefitsRepository } from '../../repositories/benefit.repository';
import { BenefitsEntity } from '../../entities/benefit.entity';
import { InputCreateBenefitDto, OutputCreateBenefitDto } from './create-benefit.dto';
import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo';

export class CreateBenefitUsecase {
    constructor(
      private benefitsRepository: IBenefitsRepository,
    ) {}

    async execute(input: InputCreateBenefitDto): Promise<OutputCreateBenefitDto> {
        const entityData = {
          name: input.name,
          description: input.description,
          item_type: input.item_type,
          item_category: input.item_category,
          parent_uuid: input.parent_uuid ? new Uuid(input.parent_uuid) : null,
          business_info_uuid: input.business_info_uuid ? new Uuid(input.business_info_uuid) : null
        }
        const benefit = BenefitsEntity.create(entityData)

        await this.benefitsRepository.create(benefit)

        return {
            uuid: benefit.uuid.uuid,
            name: benefit.name,
            description: benefit.description,
            item_type: benefit.item_type,
            item_category: benefit.item_category,
            parent_uuid: benefit.parent_uuid ? benefit.parent_uuid.uuid : null,
            business_info_uuid: benefit.business_info_uuid ? benefit.business_info_uuid.uuid : null
        }

    }
}
