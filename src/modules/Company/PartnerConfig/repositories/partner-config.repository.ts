import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { BusinessAccountEntity } from "../entities/business-account.entity";
import { PartnerConfigEntity } from "../entities/partner-config.entity";

export interface IPartnerConfigRepository extends RepositoryInterface<PartnerConfigEntity>{
  createPartnerConfig(data: PartnerConfigEntity, businessAccountEntity: BusinessAccountEntity): Promise<PartnerConfigEntity>
  findPartnersByCategory(partner_category: string, page: number, limit: number): Promise<any>
  findByPartnerId(business_info_uuid: string): Promise<PartnerConfigEntity | null>
  filterPartnersByAppUser(partner_category: string, page: number, limit: number, branch_uuid?: string, city?: string, search?: string, item_uuid?: string): Promise<any[]>
  //upsert(data: PartnerConfigEntity): Promise<PartnerConfigEntity>
}
