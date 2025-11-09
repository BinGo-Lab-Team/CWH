"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
	AcademicCapIcon,
	FireIcon,
	SparklesIcon,
	HeartIcon,
	SunIcon,
	StarIcon,
} from "@heroicons/react/24/solid";

type IconComp = React.ElementType;

interface IconItem {
	id: number;
	Icon: IconComp;
	colorClass: string;
	topPx: number;
	fromLeft: boolean;
	initialX: number;
	targetX: number;
	scale: number;
	enterDelay: number;
	enterDuration: number;
	wobbleDuration: number;
	wobbleDelay: number;
	colorShift: boolean;
	colorShiftDur: number;
	colorShiftDelay: number;
	newColorClass?: string;
}

const ICONS: IconComp[] = [
	AcademicCapIcon,
	FireIcon,
	SparklesIcon,
	HeartIcon,
	SunIcon,
	StarIcon,
];

const COLORS = [
	"text-red-500",
	"text-blue-500",
	"text-green-500",
	"text-pink-500",
	"text-purple-500",
	"text-yellow-400",
	"text-orange-400",
	"text-cyan-400",
];

const CELL = 80;
const MAX_ICONS = 260;
const ICON_PX = 16;
const ENTER_OFFSET = 240;

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

function shouldKeepCell(idx: number, totalCells: number): boolean {
	if (totalCells <= MAX_ICONS) return true;
	const stride = Math.ceil(totalCells / MAX_ICONS);
	return idx % stride === 0;
}

export default function BackgroundIcons() {
	const [icons, setIcons] = useState<IconItem[]>([]);

	useEffect(() => {
		function build() {
			const width = window.innerWidth;
			const height = window.innerHeight;

			const cols = Math.max(1, Math.floor(width / CELL));
			const rows = Math.max(1, Math.floor(height / CELL));
			const gridW = cols * CELL;
			const gridH = rows * CELL;
			const offsetX = (width - gridW) / 2;
			const offsetY = (height - gridH) / 2;

			const items: IconItem[] = [];
			const totalCells = rows * cols;
			let idx = 0;

			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++, idx++) {
					if (!shouldKeepCell(idx, totalCells)) continue;

					const cellCenterX =
							offsetX + c * CELL + CELL / 2 + rand(-CELL / 3, CELL / 3);
					const cellTopPx =
							offsetY + r * CELL + (CELL - ICON_PX) / 2 + rand(-CELL / 3, CELL / 3);

					const fromLeft = c < cols / 2;

					const targetX = fromLeft
							? cellCenterX
							: -(width - cellCenterX);

					const distFromSide = fromLeft ? cellCenterX : width - cellCenterX;
					const norm = distFromSide / Math.max(1, width / 2);
					const baseDelay = 0.15 * norm;

					items.push({
						id: r * 10000 + c,
						Icon: ICONS[(Math.random() * ICONS.length) | 0],
						colorClass: COLORS[(Math.random() * COLORS.length) | 0],
						topPx: Math.round(cellTopPx),
						fromLeft,
						initialX: fromLeft ? -ENTER_OFFSET : ENTER_OFFSET,
						targetX: Math.round(targetX),
						scale: 0.7 + Math.random() * 1.2,
						enterDelay: baseDelay + Math.random() * 0.3,
						enterDuration: 1.3 + Math.random() * 0.7,
						wobbleDuration: 3.5 + Math.random() * 3,
						wobbleDelay: Math.random() * 1.2,
						colorShift: Math.random() < 0.22,
						colorShiftDur: 3.5 + Math.random() * 3,
						colorShiftDelay: 6 + Math.random() * 10,
						newColorClass: COLORS[(Math.random() * COLORS.length) | 0],
					});
				}
			}
			setIcons(items);
		}

		build();
		let t: number | undefined;
		const onResize = () => {
			window.clearTimeout(t);
			t = window.setTimeout(build, 120);
		};
		window.addEventListener("resize", onResize);
		return () => {
			window.removeEventListener("resize", onResize);
			if (t) window.clearTimeout(t);
		};
	}, []);

	return (
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				{icons.map((it) => {
					const { Icon } = it;
					return (
							<motion.div
									key={it.id}
									className="absolute"
									style={{
										top: `${it.topPx}px`,
										left: it.fromLeft ? 0 : "auto",
										right: it.fromLeft ? "auto" : 0,
									}}
									initial={{ x: it.initialX, opacity: 0, scale: 0.85 }}
									animate={{ x: it.targetX, opacity: 1, scale: it.scale }}
									transition={{
										delay: it.enterDelay,
										duration: it.enterDuration,
										ease: "easeOut",
									}}
							>
								<motion.div
										animate={{
											y: [0, -4, 2, -3, 1, 0],
											x: [0, 1.5, -1, 2, -1.5, 0],
											rotate: [0, 1.5, -1.2, 0.8, -0.6, 0],
										}}
										transition={{
											duration: it.wobbleDuration,
											delay: it.wobbleDelay,
											repeat: Infinity,
											repeatType: "mirror",
										}}
								>
									{it.colorShift ? (
											<motion.div
													key={`${it.id}-color`}
													animate={{}}
													transition={{
														duration: it.colorShiftDur,
														repeat: Infinity,
														repeatType: "loop",
														repeatDelay: it.colorShiftDelay,
													}}
											>
												<Icon className={`w-4 h-4 ${Math.random() < 0.5 ? it.colorClass : it.newColorClass}`} />
											</motion.div>
									) : (
											<Icon className={`w-4 h-4 ${it.colorClass}`} />
									)}
								</motion.div>
							</motion.div>
					);
				})}
			</div>
	);
}