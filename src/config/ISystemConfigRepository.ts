import { SystemConfig } from "@prisma/client";

export interface ISystemConfigRepository {
    findByKey(key: string): Promise<SystemConfig | null>;
    save(data: Omit<SystemConfig, 'uuid' | 'updated_at'>): Promise<SystemConfig>;
    update(key: string, value: string, description?: string): Promise<SystemConfig>;
    getAll(): Promise<SystemConfig[]>;
}
