// hashTools.ts
import argon2 from "argon2";
import crypto from "crypto";

let fakeHash: string | null = null;

/** 获取假哈希。
 * 如果已缓存使用缓存，未缓存随机值初始化并缓存。
 * @returns - 假哈希字符串
 */
async function getFakeHash() {
    if (fakeHash) return fakeHash; // 已生成则复用
    const secret = crypto.randomBytes(32).toString("hex");
  fakeHash = await argon2.hash(secret, {
        type: argon2.argon2id,
        timeCost: 3,			// 迭代次数
        memoryCost: 2 ** 14,	// 内存成本，单位 KB
        parallelism: 1,			// 并行度
        hashLength: 32,			// 输出哈希长度，单位 字节
    });
    return fakeHash;
}

/** 验证明文与 Argon2id 哈希是否匹配。
 *  注意，该函数不抗时序攻击！
 * @param plaintext - 明文字符串
 * @param hash - 哈希字符串
 * @returns - 匹配则返回 true，否则返回 false
 */
export async function verifyHash(plaintext: string, hash: string): Promise<boolean> {

	// 判断是否为空
	if (!plaintext || !hash) {
		throw new Error("Plaintext and hash must be non-empty strings.");
	}

	try {
		return await argon2.verify(hash, plaintext);
	} catch {
		return false;
	}
}

/** 对明文进行 Argon2id 哈希。
 * @param plaintext - 明文字符串
 * @returns - 生成的哈希字符串
 */
export async function hashPlaintext(plaintext: string): Promise<string> {

	// 判断是否为空
	if (!plaintext) {
		throw new Error("Plaintext must be a non-empty string.");
	}

	// 使用 Argon2id 算法生成哈希
	const hashText = await argon2.hash(plaintext, {
		type: argon2.argon2id,
		timeCost: 3,			// 迭代次数
		memoryCost: 2 ** 14,	// 内存成本，单位 KB
		parallelism: 1,			// 并行度
		hashLength: 32,			// 输出哈希长度，单位 字节
	});

	if (!await verifyHash(plaintext, hashText)) {
		throw new Error("Hashing failed.");
	}

	return hashText;
}

/** 验证密码和哈希是否一致，抗时序攻击。
 * @param plaintext - 明文字符串
 * @param hash - 哈希字符串
 * @param fake - true使用fake_hash; false使用hash
 * @returns 匹配返回 true，不匹配或使用假哈希返回 false
 */
export async function verifyPassword(plaintext: string, fake: boolean, hash?: string): Promise<boolean> {

    // hash 非空确认
    if (!fake && !hash) throw new Error("Missing hash for real verification.");

    // fake 模式下假验证，保证耗时一致，返回恒为 false
    const isSuccess = await verifyHash(plaintext, fake ? await getFakeHash() : hash!);

    return fake ? false : isSuccess;
}