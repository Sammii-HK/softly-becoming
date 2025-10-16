import fs from "node:fs";
import path from "node:path";
import Redis from "ioredis";

const prefix = process.env.REDIS_PREFIX || "softrebuild";
const localPath = process.env.LOCAL_STORE_PATH || ".data/state.json";

let redis: Redis | null = null;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2, enableReadyCheck: false });
}

type PostedRecord = {
  key: string; // hash of lines
  ts: number;  // posted at
};

type State = {
  posted: PostedRecord[];
};

function readLocal(): State {
  try {
    const p = path.join(process.cwd(), localPath);
    const raw = fs.readFileSync(p, "utf8");
    return JSON.parse(raw);
  } catch {
    return { posted: [] };
  }
}

function writeLocal(s: State) {
  const p = path.join(process.cwd(), localPath);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(s, null, 2));
}

export async function hasPosted(hash: string): Promise<boolean> {
  if (redis) {
    const key = `${prefix}:posted:${hash}`;
    const exists = await redis.exists(key);
    return exists === 1;
  } else {
    const s = readLocal();
    return s.posted.some(p => p.key === hash);
  }
}

export async function markPosted(hash: string) {
  if (redis) {
    const key = `${prefix}:posted:${hash}`;
    // expire in ~1000 days (practically forever for our purposes)
    await redis.set(key, "1", "EX", 60 * 60 * 24 * 1000);
  } else {
    const s = readLocal();
    s.posted.push({ key: hash, ts: Date.now() });
    writeLocal(s);
  }
}
