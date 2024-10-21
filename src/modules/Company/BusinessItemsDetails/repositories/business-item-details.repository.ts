import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { BenefitGroupsEntity } from "../../BenefitGroups/entities/benefit-groups.entity";
import { BusinessItemsDetailsEntity } from "../entities/businessItemDetails.entity";
import { OutputFindEmployerItemDetailsDTO } from "../usecases/CorrectAdmin/findItemDetailsByCorrect/dto/find-employer-item.dto";

export interface IBusinessItemDetailsRepository extends RepositoryInterface<BusinessItemsDetailsEntity>{
  findByItemUuidAndBusinessInfo(businessInfoId: string, itemId: string):Promise<OutputFindEmployerItemDetailsDTO | null>
  findAllEmployerItems(businessInfoId: string):Promise<OutputFindEmployerItemDetailsDTO[] | []>
  findByIdWithItems(id: Uuid):Promise<OutputFindEmployerItemDetailsDTO | null>
  createOrUpdateItemAndGroup(itemEntity: BusinessItemsDetailsEntity, groupEntity: BenefitGroupsEntity): Promise<any>
}
