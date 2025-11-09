import { db } from "@src/utils/db";
import { redis_db } from "@lib/redis_db";

// 从 cookie 中的 sessionId 获取对应的 userId
export async function getUserFromCookie(sessionId: string | undefined)
	: Promise<{ success: boolean; userId: string | null }>
{
	// sessionId 非法
	if (!sessionId || sessionId.trim().length === 0) {
		return { success: false, userId: null };
	}

	// 先查 Redis
	if (redis_db) {
		const redisData = await redis_db.hgetall(`session:${sessionId}`);
		if (redisData && redisData.userId && redisData.expiresAt) {
			const expiresAt = new Date(redisData.expiresAt);

			// 判断是否过期
			if (expiresAt > new Date()) {
				// 用户状态也要一起存到 Redis，减少 DB 查询
				if (redisData.status === "active" || redisData.status === "terminating") {
					return { success: true, userId: redisData.userId };
				} else {
					return { success: false, userId: null };
				}
			} else {
				// 已过期，删除 Redis 中的缓存
				await redis_db.del(`session:${sessionId}`);
			}
		}
	}

	// Redis 没找到，查数据库
	const session = await db.sessions.findUnique({
		where: { token: sessionId },
		select: {
			user_id: true,
			expires_at: true,
			user: { select: { status: true } },
		},
	});

	// 数据库没找到或过期
	if (!session || session.expires_at <= new Date()) {
		return { success: false, userId: null };
	}

	// 用户状态检查
	if (session.user.status !== "active" && session.user.status !== "terminating") {
		return { success: false, userId: null };
	}

	// 写回 Redis，设置 TTL（基于 expires_at）
	if (redis_db) {
		const ttlSeconds = Math.floor((session.expires_at.getTime() - Date.now()) / 1000);
		if (ttlSeconds > 0) {
			await redis_db.hset(`session:${sessionId}`, {
				userId: session.user_id,
				status: session.user.status,
				expiresAt: session.expires_at.toISOString(), // 存储绝对时间，便于比较
			});
			await redis_db.expire(`session:${sessionId}`, ttlSeconds);
		}
	}

	return { success: true, userId: session.user_id };
}


// 验证给定的 userId 是否与 cookie 中的 sessionId 对应的用户匹配
export async function verifyUserWithCookie(userId: string, sessionId: string | undefined)
	: Promise<boolean>
{
	// sessionId 非法
	if (!sessionId || sessionId.trim().length === 0) {
		return false;
	}

	// 查找 session 并关联用户状态
	const session = await db.sessions.findUnique({
		where: { token: sessionId },
		select: {
			user_id: true,
			expires_at: true,
			user: {
				select: { status: true },
			},
		},
	});

	// session 不存在或过期
	if (!session || session.expires_at <= new Date()) {
		return false;
	}

	// 账户状态不合法
	if (!session.user || (session.user.status !== "active" && session.user.status !== "terminating")) {
		return false;
	}

	// 检查 user_id 是否匹配
	return session.user_id === userId;
}

