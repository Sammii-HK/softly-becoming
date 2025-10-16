import Redis from "ioredis";

let redis: Redis | null = null;
if (process.env.REDIS_URL) redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2, enableReadyCheck: false });

type Log = {
  ts: number;
  hash: string;
  theme: string;
  tone: string;
  structure: string;
};

export async function logPost(l: Log) {
  if (!redis) return;
  const key = `${process.env.REDIS_PREFIX || "softrebuild"}:log`;
  await redis.lpush(key, JSON.stringify(l));
  await redis.ltrim(key, 0, 5000); // keep last 5k
}

export async function readRecent(limit = 100) {
  if (!redis) return [];
  const key = `${process.env.REDIS_PREFIX || "softrebuild"}:log`;
  const rows = await redis.lrange(key, 0, limit - 1);
  return rows.map(r => JSON.parse(r));
}
