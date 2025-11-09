// lib/redis_db.ts
import Redis from "ioredis";

declare global {
	// 为了防止 Next.js 热重载时重复实例化
	var _redis: Redis | undefined;
}

// 如果全局没有实例，则创建一个
export const redis_db =
	global._redis ??
	new Redis(process.env.REDIS_URL!);

// 开发环境下存到 global，避免热更新重复连接
if (process.env.NODE_ENV !== "production") global._redis = redis_db;
