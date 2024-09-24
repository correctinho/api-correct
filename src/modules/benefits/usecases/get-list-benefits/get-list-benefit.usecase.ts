import { BenefitsEntity } from '../../entities/benefit.entity';
import { IBenefitsRepository } from '../../repositories/benefit.repository';
import { InputListCustomerDTO, OutputListBenefitDTO } from './list-benefits.dto';

export class GetListBenefitUsecase {
    constructor(private benefitsRepository: IBenefitsRepository) {}

    async execute(input: InputListCustomerDTO): Promise<OutputListBenefitDTO> {

        const benefit = await this.benefitsRepository.findAll();

        return OutputMapper.toOutput(benefit);
    }
}

class OutputMapper {
    static toOutput(benefit: BenefitsEntity[]): OutputListBenefitDTO{
        return{
            benefits: benefit.map((benefit) => ({
                uuid: benefit.uuid,
                name: benefit.name,
                description: benefit.description,
                item_type: benefit.item_type,
                item_category: benefit.item_category,
                created_at: benefit.created_at,
                updated_at: benefit.updated_at
            }))
        }
    }
}
