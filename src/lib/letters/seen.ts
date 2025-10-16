import Redis from "ioredis";
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2, enableReadyCheck: false }) : null;
const PREFIX = (process.env.REDIS_PREFIX || "softrebuild") + ":keeps";

export async function wasUsedKeep(line: string) {
  if (!redis) return false;
  return (await redis.sismember(PREFIX, line)) === 1;
}

export async function markUsedKeep(line: string) {
  if (!redis) return;
  await redis.sadd(PREFIX, line);
}
