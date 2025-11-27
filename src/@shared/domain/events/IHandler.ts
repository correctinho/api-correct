import { IDomainEvent } from "./IDomainEvent";

// Define que um handler sabe lidar com um tipo específico de evento (T)
export interface IHandle<T extends IDomainEvent> {
  handle(event: T): Promise<void>;
}