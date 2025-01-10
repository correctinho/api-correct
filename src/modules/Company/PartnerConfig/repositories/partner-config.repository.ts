import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { PartnerConfigEntity } from "../entities/partner-config.entity";

export interface IPartnerConfigRepository extends RepositoryInterface<PartnerConfigEntity>{
  createPartnerConfig(data: PartnerConfigEntity): Promise<PartnerConfigEntity>
  findPartnersByCategory(partner_category: string, page: number, limit: number): Promise<any>
  findByPartnerId(business_info_uuid: string): Promise<PartnerConfigEntity | null>
  //upsert(data: PartnerConfigEntity): Promise<PartnerConfigEntity>
}
