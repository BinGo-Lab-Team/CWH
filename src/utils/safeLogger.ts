/**
 * SafeLogger - 安全日志记录器
 *
 * 这个模块提供了一个安全的日志记录系统，能够自动屏蔽敏感数据如密码、邮箱、电话号码等。
 * 支持多种日志级别，确保在记录日志时不会泄露用户隐私信息。
 *
 * 主要功能：
 * - 自动识别和屏蔽敏感数据
 * - 支持多种日志级别 (DEBUG, INFO, WARN, ERROR)
 * - 递归处理嵌套对象和数组
 * - 格式化日志输出，包含时间戳
 */

/**
 * 敏感数据类型定义
 */
export type SensitiveData = {
	userId?: string | number;    // 用户ID
	username?: string;           // 用户名
	email?: string;              // 邮箱地址
	phone?: string;              // 电话号码
	password?: string;           // 密码
	token?: string;              // 访问令牌
	apiKey?: string;             // API密钥
	sessionId?: string;          // 会话ID
};

/**
 * 日志数据类型定义
 * 用于传递给日志方法的任意数据对象
 */
export type LogData = Record<string, unknown>;

/**
 * 日志级别常量定义
 * 定义了系统支持的所有日志级别
 */
export const LOG_LEVELS = {
	DEBUG: "DEBUG",   // 调试信息
	INFO: "INFO",     // 一般信息
	WARN: "WARN",     // 警告信息
	ERROR: "ERROR",   // 错误信息
} as const;

// 敏感字段映射表 - 定义了各种可能的敏感字段名称变体，用于自动识别需要屏蔽的数据
const SENSITIVE_KEYS = {
	username: ["username", "user_name"],                          // 用户名相关字段
	email: ["email", "mail"],                                     // 邮箱相关字段
	phone: ["phone", "mobile"],                                   // 电话相关字段
	password: ["password", "pwd"],                                // 密码相关字段
	token: ["token", "auth_token", "access_token"],              // 令牌相关字段
	apiKey: ["apikey", "api_key"],                               // API密钥相关字段
	sessionId: ["sessionid", "session_id"],                      // 会话ID相关字段
};

/**
 * SafeLogger 安全日志记录器类
 * 提供安全的日志记录功能，自动屏蔽敏感数据
 */
class SafeLogger {
	// 屏蔽用户名 - 根据用户名长度采用不同的屏蔽策略
	private maskUsername(username: string): string {
		// 长度小于等于2：全部屏蔽
		if (username.length <= 2) return "*".repeat(username.length);
		// 长度小于等于4：保留首尾字符
		if (username.length <= 4) return username[0] + "*".repeat(username.length - 2) + username[username.length - 1];
		// 长度大于4：保留前2位和后2位
		return username.substring(0, 2) + "*".repeat(username.length - 4) + username.substring(username.length - 2);
	}

	// 屏蔽邮箱地址 - 保留域名部分，屏蔽用户名部分
	private maskEmail(email: string): string {
		const [local, domain] = email.split("@");
		// 如果没有域名部分，全部屏蔽
		if (!domain) return "*".repeat(email.length);

		// 对邮箱的用户名部分进行屏蔽
		const maskedLocal =
			local.length <= 2
				? "*".repeat(local.length)
				: local.length <= 4
					? local[0] + "*".repeat(local.length - 2) + local[local.length - 1]
					: local.substring(0, 2) + "*".repeat(local.length - 4) + local.substring(local.length - 2);

		return `${maskedLocal}@${domain}`;
	}

	// 屏蔽电话号码 - 保留前3位和后4位，中间用*号屏蔽
	private maskPhone(phone: string): string {
		// 长度小于等于7：全部屏蔽
		if (phone.length <= 7) return "*".repeat(phone.length);
		// 保留前3位和后4位
		return phone.substring(0, 3) + "*".repeat(phone.length - 7) + phone.substring(phone.length - 4);
	}

	// 屏蔽密码 - 将密码完全屏蔽，最多显示8个*号
	private maskPassword(password: string): string {
		return "*".repeat(Math.min(password.length, 8));
	}

	// 屏蔽访问令牌 - 保留前6位和后4位，中间用*号屏蔽
	private maskToken(token: string): string {
		// 长度小于等于10：全部屏蔽
		if (token.length <= 10) return "*".repeat(token.length);
		// 保留前6位和后4位
		return token.substring(0, 6) + "*".repeat(token.length - 10) + token.substring(token.length - 4);
	}

	// 屏蔽API密钥 - 保留前4位和后4位，中间用*号屏蔽
	private maskApiKey(apiKey: string): string {
		// 长度小于等于8：全部屏蔽
		if (apiKey.length <= 8) return "*".repeat(apiKey.length);
		// 保留前4位和后4位
		return apiKey.substring(0, 4) + "*".repeat(apiKey.length - 8) + apiKey.substring(apiKey.length - 4);
	}

	// 屏蔽会话ID - 保留前4位和后4位，中间用*号屏蔽
	private maskSessionId(sessionId: string): string {
		// 长度小于等于8：全部屏蔽
		if (sessionId.length <= 8) return "*".repeat(sessionId.length);
		// 保留前4位和后4位
		return sessionId.substring(0, 4) + "*".repeat(sessionId.length - 8) + sessionId.substring(sessionId.length - 4);
	}

	// 递归屏蔽敏感数据 - 遍历对象的所有属性，识别并屏蔽敏感数据
	private maskSensitiveData(data: unknown): unknown {
		// 处理null和undefined
		if (data === null || data === undefined) return data;
		// 处理基本数据类型（字符串、数字、布尔值）
		if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") return data;
		// 处理数组：递归处理每个元素
		if (Array.isArray(data)) return data.map((item) => this.maskSensitiveData(item));

		// 处理对象
		if (typeof data === "object") {
			const masked: Record<string, unknown> = {};
			for (const [key, value] of Object.entries(data)) {
				const lowerKey = key.toLowerCase();

				// ID相关字段不需要屏蔽，直接保留
				if (["userid", "user_id", "id"].includes(lowerKey)) {
					masked[key] = value;
					continue;
				}

				// 只对字符串值进行敏感数据检查和屏蔽
				if (typeof value === "string") {
					if (SENSITIVE_KEYS.username.includes(lowerKey)) {
						masked[key] = this.maskUsername(value);
					} else if (SENSITIVE_KEYS.email.includes(lowerKey)) {
						masked[key] = this.maskEmail(value);
					} else if (SENSITIVE_KEYS.phone.includes(lowerKey)) {
						masked[key] = this.maskPhone(value);
					} else if (SENSITIVE_KEYS.password.includes(lowerKey)) {
						masked[key] = this.maskPassword(value);
					} else if (SENSITIVE_KEYS.token.includes(lowerKey)) {
						masked[key] = this.maskToken(value);
					} else if (SENSITIVE_KEYS.apiKey.includes(lowerKey)) {
						masked[key] = this.maskApiKey(value);
					} else if (SENSITIVE_KEYS.sessionId.includes(lowerKey)) {
						masked[key] = this.maskSessionId(value);
					} else {
						// 非敏感字符串，直接保留
						masked[key] = value;
					}
				} else {
					// 非字符串值，递归处理
					masked[key] = this.maskSensitiveData(value);
				}
			}
			return masked;
		}
		return data;
	}

	// 格式化日志消息 - 生成包含时间戳、日志级别、消息和数据的格式化日志字符串
	private formatLogMessage(level: string, message: string, data?: LogData): string {
		const ts = new Date().toISOString();  // ISO格式的时间戳
		const masked = data ? this.maskSensitiveData(data) : null;  // 屏蔽敏感数据
		let out = `[${ts}] [${level}] ${message}`;
		if (masked) out += ` | Data: ${JSON.stringify(masked)}`;  // 添加数据部分
		return out;
	}

	/**
	 * 调试级别日志
	 * @param msg 日志消息
	 * @param data 可选的附加数据
	 */
	debug(msg: string, data?: LogData): void {
		console.debug(this.formatLogMessage(LOG_LEVELS.DEBUG, msg, data));
	}

	/**
	 * 信息级别日志
	 * @param msg 日志消息
	 * @param data 可选的附加数据
	 */
	info(msg: string, data?: LogData): void {
		console.info(this.formatLogMessage(LOG_LEVELS.INFO, msg, data));
	}

	/**
	 * 警告级别日志
	 * @param msg 日志消息
	 * @param data 可选的附加数据
	 */
	warn(msg: string, data?: LogData): void {
		console.warn(this.formatLogMessage(LOG_LEVELS.WARN, msg, data));
	}

	/**
	 * 错误级别日志
	 * @param msg 日志消息
	 * @param data 可选的附加数据
	 */
	error(msg: string, data?: LogData): void {
		console.error(this.formatLogMessage(LOG_LEVELS.ERROR, msg, data));
	}

	/**
	 * 数据清理方法
	 * 提供公共接口用于清理敏感数据，可以在其他地方调用
	 * @param data 需要清理的数据
	 * @returns 清理后的数据
	 */
	sanitizeData(data: unknown): unknown {
		return this.maskSensitiveData(data);
	}

    /**
     * 专门处理未知错误对象，并允许添加上下文信息
     * @param msg  自定义的上下文消息（说明在哪出错）
     * @param error 任意错误对象（Error 实例 / 字符串 / 数字 / 对象等）
     */
    logError(msg: string, error: unknown): void {
        if (error instanceof Error) {
            // 如果是 Error 实例，提取 message 和 stack
            this.error(msg, {
                name: error.name,
                message: error.message,
                stack: error.stack,
            });
        } else if (typeof error === "object" && error !== null) {
            // 如果是对象，就直接记录
            this.error(msg, error as LogData);
        } else {
            // 其他类型（字符串、数字、null、undefined）
            this.error(msg, { value: String(error) });
        }
    }
}

/**
 * 导出SafeLogger实例
 * 提供全局单例，可在整个应用中使用
 *
 * 使用示例：
 * import { safeLogger } from "@utils/safeLogger";
 */
export const safeLogger = new SafeLogger();
