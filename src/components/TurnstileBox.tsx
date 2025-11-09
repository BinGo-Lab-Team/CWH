// components/TurnstileFill.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

type Theme = "light" | "dark";
type Size = "normal" | "compact";

export default function TurnstileFill({
                                          siteKey,
                                          theme = "light",
                                          size = "normal",
                                          boxHeight = 65,               // 视觉容器高度（可改成 45 以贴合你的输入框高度）
                                          onSuccess,
                                          onError,
                                      }: {
    siteKey: string;
    theme?: Theme;
    size?: Size;
    boxHeight?: number;
    onSuccess?: (t: string) => void;
    onError?: () => void;
}) {
    // Turnstile 的“自然尺寸”
    const NATURAL = useMemo(() => (size === "compact" ? { w: 130, h: 65 } : { w: 300, h: 65 }), [size]);

    const outerRef = useRef<HTMLDivElement | null>(null);
    const [containerW, setContainerW] = useState<number>(0);

    useEffect(() => {
        const el = outerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => setContainerW(entry.contentRect.width));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // 让它“看起来填满”：按父容器宽度算缩放比例
    const scale = containerW > 0 ? containerW / NATURAL.w : 1;
    const scaledW = NATURAL.w * scale; // == containerW
    const scaledH = NATURAL.h * scale;

    // 因为只能“以左上角缩放”，我们用 left 偏移把它居中（此时 scaledW == containerW，left=0 也 OK）
    const left = Math.max((containerW - scaledW) / 2, 0);

    return (
        <div
            ref={outerRef}
            className="w-full overflow-hidden rounded-md border border-gray-200 shadow-sm relative"
            style={{ height: boxHeight }} // 视觉容器高度，裁切多余部分以获得“铺满”的效果
        >
            <div
                className="absolute top-1/2"
                style={{
                    left,                         // 纠偏：配合左上角缩放达到水平居中
                    width: NATURAL.w,
                    height: NATURAL.h,
                    transform: `translateY(-50%) scale(${scale})`,
                    transformOrigin: "left top",  // 明确以左上角缩放
                }}
            >
                <Turnstile
                    siteKey={siteKey}
                    onSuccess={onSuccess}
                    onError={onError}
                    options={{
                        theme,
                        size,
                        appearance: "always",
                    }}
                />
            </div>
        </div>
    );
}
