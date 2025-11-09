export function VerificationEmail({ username, link }: { username: string; link: string }) {
	return `
    <div style="font-family: Arial, sans-serif; color:#333; line-height:1.6;">
      <h2>Dear ${username}</h2>
      	<p>这里是 CWH Blog, 欢迎你的注册！</p>
      	<p>祝在 CWH Blog 找到你的理想，找到你所热爱之事。</p>
      	<p>Happy hacking!</p>
      	<p>点击下方链接以完成注册（有效期1小时）：</p>
      	<p>
        	<a href="${link}" style="color:#4f46e5;">${link}</a>
      	</p>
      	<p style="font-size:12px; color:#888;">
        	如果这不是您的操作，您可以放心忽略此邮件。
      	</p>
    </div>
  `;
}
