export interface IDomainEvent {
  dateTimeOccurred: Date;
  getAggregateId(): string; // ID da entidade principal envolvida
}