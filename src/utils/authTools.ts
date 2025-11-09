import { db } from "@src/utils/db";
import { redis_db } from "@lib/redis_db";

export async function getUserStatus(userId: string)
	: Promise<string | null>
{
	// 先查 Redis
	if (redis_db) {
		const status = await redis_db.get(`users:${userId}`);
		if (status) {
			return status;
		}
	}

	// Redis 没找到，查数据库
	const user = await db.users.findUnique({
		where: { id: userId },
		select: { status: true },
	});

	if (user) {
		// 写回 Redis，并且设置 TTL
		if (redis_db) {
			await redis_db.set(`users:${userId}`, user.status, "EX", 3600);
		}
		return user.status;
	}

	return null;
}