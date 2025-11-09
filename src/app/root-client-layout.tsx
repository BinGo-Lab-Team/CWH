'use client'

import { ThemeProvider } from 'next-themes'

export default function RootClientLayout({
                                             children,
                                         }: {
    children: React.ReactNode
}) {
    return (
        <body className="transition-colors bg-background text-foreground min-h-screen">
        <ThemeProvider
            attribute="data-theme"      // 使用 data-theme 而非 class
            defaultTheme="system"       // 默认跟随系统
            enableSystem                // 启用系统检测
            themes={['light', 'dark', 'forest']} // 支持的主题
        >
            {children}
        </ThemeProvider>
        </body>
    )
}
