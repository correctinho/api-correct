import { prismaClient } from "../../infra/databases/prisma.config";
import { SystemConfig } from "@prisma/client";

export class SystemConfigPrismaRepository implements SystemConfigPrismaRepository {
    async findByKey(key: string): Promise<SystemConfig | null> {
        return await prismaClient.systemConfig.findUnique({
            where: { key }
        });
    }

    async save(data: Omit<SystemConfig, 'uuid' | 'updated_at'>): Promise<SystemConfig> {
        return await prismaClient.systemConfig.create({
            data
        });
    }

    async update(key: string, value: string, description?: string): Promise<SystemConfig> {
        return await prismaClient.systemConfig.update({
            where: { key },
            data: { value, description }
        });
    }

    async getAll(): Promise<SystemConfig[]> {
        return await prismaClient.systemConfig.findMany();
    }
}
