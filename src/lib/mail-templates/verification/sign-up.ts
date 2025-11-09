"use server";

import { db } from "@src/utils/db";
import { randomBytes } from "crypto";
import { sendMail } from "@src/utils/sendMail";
import { VerificationEmail } from "@lib/mail-templates/verification/VerificationEmail";
import { safeLogger } from "@src/utils/safeLogger";

export async function sendVerificationEmail(userId: string, email: string) {

    // 生成随机 token
    const token = randomBytes(32).toString("hex");

    // 存储 token 到数据库
    try {
        await db.verification_tokens.create({
            data: {
                user_id: userId,
                token,
                type: "register",
            },
        });
    } catch (err) {
        safeLogger.logError("sendVerificationEmail error: ", err);
        return false;
    }

    // 获取用户昵称，生成并发送邮件
    try {
        // 获取昵称用于邮件内容
        const user = await db.users.findUnique({
            where: { id: userId },
            select: { nickname: true },
        });

        if (!user) throw new Error("User not found");

        // 生成验证链接
        const link = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email?token=${token}`;

        // 使用模板生成邮件内容
        const html = VerificationEmail({username: user.nickname, link});
        const subject = "CWH Blog - 验证你的邮箱";
        const text = `你好 ${email}, 请点击以下链接完成邮箱验证: ${link}`;
        // 发送邮件
        await sendMail({ to: email, subject, html, text });
    } catch (err) {
        safeLogger.logError("sendVerificationEmail error: ", err);
        return false;
    }

	return true;
}
