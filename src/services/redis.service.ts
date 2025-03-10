import Redis from "ioredis";

// singleton
export class RedisService {
  private static instance: RedisService;
  private readonly redisConnection: Redis;

  constructor() {
    this.redisConnection = new Redis({
      maxRetriesPerRequest: null,
      host: process.env.REDIS_HOST || "localhost",
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public get getRedisConnection() {
    return this.redisConnection;
  }

  async lock(lockKey: string, ttlMs: number): Promise<boolean> {
    const ttlSeconds = Math.ceil(ttlMs / 1000);
    const result = await this.redisConnection.set(
      lockKey,
      "locked",
      "EX",
      ttlSeconds,
      "NX",
    );
    return result === "OK";
  }

  public async renewLock(lockKey: string, ttlMs: number): Promise<boolean> {
    const result = await this.getRedisConnection.persist(lockKey);

    if (result === 0) {
      return false;
    }

    await this.getRedisConnection.pexpire(lockKey, ttlMs);
    return true;
  }

  async unlock(lockKey: string): Promise<void> {
    await this.redisConnection.del(lockKey);
  }
}
