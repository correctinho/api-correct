import redisClient from "./redis.client";

export interface IRedisCacheRepository {
    set(key: string, value: string, expirationSeconds: number): Promise<void>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<void>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<void>;
}

export class RedisCacheRepository implements IRedisCacheRepository {
    async set(key: string, value: string, expirationSeconds: number): Promise<void> {
        await redisClient.set(key, value, "EX", expirationSeconds);
    }

    async get(key: string): Promise<string | null> {
        return await redisClient.get(key);
    }

    async del(key: string): Promise<void> {
        await redisClient.del(key);
    }

    async incr(key: string): Promise<number> {
        return await redisClient.incr(key);
    }

    async expire(key: string, seconds: number): Promise<void> {
        await redisClient.expire(key, seconds);
    }
}