import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { BusinessItemsDetailsEntity } from "../entities/businessItemDetails.entity";

export interface IBusinessItemDetailsRepository extends RepositoryInterface<BusinessItemsDetailsEntity>{
  findByItemUuidAndBusinessInfo(businessInfoId: string, itemId: string):Promise<BusinessItemsDetailsEntity| null>
  findAllEmployerItems(businessInfoId: string):Promise<BusinessItemsDetailsEntity[] | []>
}
