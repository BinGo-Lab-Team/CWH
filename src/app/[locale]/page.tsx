'use client';
import {safeLogger} from "@utils/safeLogger";

export default function Home() {
  return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-8">
        {/* 标题 */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">
          Tailwind v4 Config Test ✅
        </h1>
        
        {/* 卡片（测试 max-w / spacing / shadow / radius） */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 max-w-md w-full">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            自定义主题可视验证
          </h2>
          
          <ul className="space-y-2 text-gray-700 dark:text-gray-200 text-base">
            <li>🎨 颜色系统</li>
            <li>⬜ 圆角变量</li>
            <li>📏 间距系统</li>
            <li>🔤 字体大小</li>
            <li>🌑 暗黑模式</li>
            <li>🧊 自定义阴影</li>
          </ul>
          
          {/* 按钮（测试 hover / spacing / rounded / shadow） */}
          <button onClick={() => safeLogger.info("login", {username: "abcdef", email: "user@example.com", password: "mypassword", phone: "18888888888",})} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg shadow-sm transition">
            发送日志
          </button>
        </div>
        
        {/* 响应式测试 */}
        <p className="mt-8 text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg">
          调整窗口大小，看我变大 😎
        </p>
      </main>
  );
}
