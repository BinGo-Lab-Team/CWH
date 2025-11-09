"use server";

import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export interface SendMailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
}

//底层统一邮件发送函数
export async function sendMail({ to, subject, html, text }: SendMailOptions) {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.NODEMAILER_EMAIL,
			pass: process.env.NODEMAILER_PASSWORD,
		},
	});

	const mailOptions: Mail.Options = {
		from: process.env.NODEMAILER_EMAIL,
		to,
		subject,
		html,
		text: text ?? html.replace(/<[^>]+>/g, ""), // 自动生成纯文本
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("验证邮件已发送到:", mailOptions.to);
		return { success: true, message: "邮件已发送" };
	} catch (err) {
		console.error("邮件发送失败:", err);
		return { success: false, message: "邮件发送失败" };
	}
}
