"use client";

import { useEffect } from "react";

// ASCII 艺术字
const ASCII_BANNER = String.raw`
 /$$$$$$$  /$$            /$$$$$$                  /$$        /$$$$$$  /$$$$$$$ 
| $$__  $$|__/           /$$__  $$                | $$       /$$__  $$| $$__  $$
| $$  \ $$ /$$ /$$$$$$$ | $$  \__/  /$$$$$$       | $$      | $$  \ $$| $$  \ $$
| $$$$$$$ | $$| $$__  $$| $$ /$$$$ /$$__  $$      | $$      | $$$$$$$$| $$$$$$$ 
| $$__  $$| $$| $$  \ $$| $$|_  $$| $$  \ $$      | $$      | $$__  $$| $$__  $$
| $$  \ $$| $$| $$  | $$| $$  \ $$| $$  | $$      | $$      | $$  | $$| $$  \ $$
| $$$$$$$/| $$| $$  | $$|  $$$$$$/|  $$$$$$/      | $$$$$$$$| $$  | $$| $$$$$$$/
|_______/ |__/|__/  |__/ \______/  \______/       |________/|__/  |__/|_______/                                                                                                
`;

// 合成函数
function printBanner(projectName?: string) {
    const title = projectName ? `\n${projectName}\n` : "";
    // 统一样式：等宽字体、粗体、适度行高
    const style = "font-family: monospace; font-weight: 700; line-height: 1.05;";
    console.log(`%c${ASCII_BANNER}%c${title}`, style, "font-weight: 600;");
}

// 组件
export default function InitConsoleBanner() {
    useEffect(() => {
        // 本标签页只执行一次（关闭标签页重置）
        if (!sessionStorage.getItem("console_banner_printed")) {
            // 可传你的项目名
            printBanner("CWH Blog");
            sessionStorage.setItem("console_banner_printed", "1");
        }
    }, []);

    return null;
}
