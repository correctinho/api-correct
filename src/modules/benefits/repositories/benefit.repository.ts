import RepositoryInterface from '../../../@shared/domain/repository/repository-interface';
import { BusinessItemsDetailsEntity } from '../../Company/BusinessItemsDetails/entities/businessItemDetails.entity';
import { BenefitsEntity } from '../entities/benefit.entity';

export interface IBenefitsRepository extends RepositoryInterface<BenefitsEntity> {
  findByName(name: string):Promise<BenefitsEntity | null>
  findWithBranches(id: string):Promise<any[]>
  createCustomBenefit(benefit: BenefitsEntity, itemDetails: BusinessItemsDetailsEntity): Promise<void>
  findByBusiness(business_info_uuid: string, item_name: string): Promise<BenefitsEntity | null>
}
