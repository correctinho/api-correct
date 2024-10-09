import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { BenefitGroupsEntity } from "../entities/benefit-groups.entity";

export interface IBenefitGroupsRepository extends RepositoryInterface<BenefitGroupsEntity>{
  createOrUpdate(data: BenefitGroupsEntity):Promise<BenefitGroupsEntity>
  findAllByBusiness(business_info_uuid: string):Promise<BenefitGroupsEntity[] | []>
  createReturn(data: BenefitGroupsEntity): Promise<BenefitGroupsEntity>
}
