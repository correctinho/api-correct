import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo';
import { CustomError } from '../../../../errors/custom.error';
import { IBenefitsRepository } from '../../repositories/benefit.repository';
import { OutputGetBenefitsDTO } from './get-benefit.dto';

export class GetBenefitByIDUsecase {
  constructor(private benefitsRepository: IBenefitsRepository) { }

  async execute(uuid: string): Promise<OutputGetBenefitsDTO> {
    if (!uuid) throw new CustomError("UUID is required", 400)
    const benefit = await this.benefitsRepository.findWithBranches(uuid);
    if (benefit.length === 0) throw new CustomError("Benefit not found", 404);

    return {
      uuid: benefit[0].uuid,
      Item: {
        uuid: benefit[0].Item.uuid,
        name: benefit[0].Item.name,
        description: benefit[0].Item.description,
        item_type: benefit[0].Item.item_type,
        item_category: benefit[0].Item.item_category,
        created_at: benefit[0].Item.created_at,
        updated_at: benefit[0].Item.updated_at
      },
      Branch: benefit.map(branch => {
        return {
          branch_uuid: branch.Branch.uuid,
          name: branch.Branch.name,
          marketing_tax: branch.Branch.marketing_tax,
          admin_tax: branch.Branch.admin_tax,
          market_place_tax: branch.Branch.market_place_tax,
          created_at: branch.Branch.created_at,
          updated_at: branch.Branch.updated_at
        }
      })

    }
  }
}
