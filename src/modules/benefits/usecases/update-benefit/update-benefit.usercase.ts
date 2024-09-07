import { IBenefitsRepository } from '../../repositories/benefit.repository';
import { InputUpdateBenefitDTO, OutputUpdateBenefitDTO } from './update-benefit.dto';
import { CustomError } from '../../../../errors/custom.error';
import { BenefitsEntity } from '../../entities/benefit.entity';

export class UpdateBenefitUsecase {
    private BenefitsRepository: IBenefitsRepository
    constructor(BenefitsRepository: IBenefitsRepository) {
        this.BenefitsRepository = BenefitsRepository
    }

    async execute(input: InputUpdateBenefitDTO): Promise<OutputUpdateBenefitDTO> {
        if (!input.uuid) throw new CustomError("UUID is required", 400)

        const findBenefit = await this.BenefitsRepository.find(input.uuid)
        if (!findBenefit) throw new CustomError("Item not found", 404)


        const benefit = new BenefitsEntity(findBenefit);

        benefit.changeName(input.name)
        benefit.changeDescription(input.description)
        benefit.changeItemType(input.item_type)
        benefit.changeItemCategory(input.item_category)
        benefit.changeParentUuid(input.parent_uuid)
        benefit.changeBusinessInfoUuid(input.business_info_uuid)

        await this.BenefitsRepository.update(benefit)
        return {
            uuid: benefit.uuid.uuid,
            name: benefit.name,
            description: benefit.description,
            item_type: benefit.item_type,
            item_category: benefit.item_category,
            parent_uuid: benefit.parent_uuid ? benefit.parent_uuid.uuid : null,
            business_info_uuid: benefit.business_info_uuid ? benefit.business_info_uuid.uuid : null,
            created_at: benefit.created_at,
            updated_at: benefit.updated_at
        }
    }
}
