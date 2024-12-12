import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { PartnerConfigEntity } from "../entities/partner-config.entity";

export interface IPartnerConfigRepository extends RepositoryInterface<PartnerConfigEntity>{
  createPartnerConfig(data: PartnerConfigEntity): Promise<PartnerConfigEntity>
}
