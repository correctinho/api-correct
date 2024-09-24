import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { BusinessItemsDetailsEntity } from "../entities/businessItemDetails.entity";
import { OutputFindEmployerItemDetailsDTO } from "../usecases/CorrectAdmin/findItemDetailsByCorrect/dto/find-employer-item.dto";

export interface IBusinessItemDetailsRepository extends RepositoryInterface<BusinessItemsDetailsEntity>{
  findByItemUuidAndBusinessInfo(businessInfoId: string, itemId: string):Promise<OutputFindEmployerItemDetailsDTO | null>
  findAllEmployerItems(businessInfoId: string):Promise<OutputFindEmployerItemDetailsDTO[] | []>
}
