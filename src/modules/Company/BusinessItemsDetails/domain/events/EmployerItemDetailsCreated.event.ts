import { IDomainEvent } from "../../../../../@shared/domain/events/IDomainEvent";

// Usando 'any' apenas para o exemplo, substitua pelas suas Entidades reais
export class EmployerItemDetailsCreatedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;
  public employerItemDetails: any; // BusinessItemsDetailsEntity
  public itemInfo: any; // A entidade do Item/Benefício completo (com item_category)

  constructor(employerItemDetails: any, itemInfo: any) {
    this.dateTimeOccurred = new Date();
    this.employerItemDetails = employerItemDetails;
    this.itemInfo = itemInfo;
  }

  getAggregateId(): string {
    return this.employerItemDetails.uuid.uuid;
  }
}