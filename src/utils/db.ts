import { PrismaClient } from "@prisma/client";

// 给 TypeScript 声明 globalThis 上的 prisma
declare global {
	// 官方推荐使用var，忽略var警告
	var prisma: PrismaClient | undefined;
}

// 单例 PrismaClient
export const db = globalThis.prisma ?? new PrismaClient();

// 在开发环境下避免热重载重复实例化
if (process.env.NODE_ENV !== "production") {
	globalThis.prisma = db;
}
