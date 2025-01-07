import { Uuid } from "../../ValueObjects/uuid.vo";

export default interface RepositoryInterface<T> {
    create(entity: T): Promise<void>;
    update(entity: T): Promise<void>;
    find(id: Uuid): Promise<T | null>;
    findAll(): Promise<T[]>;
}
