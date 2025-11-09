import { randomBytes } from "crypto";

export function randomToken(size: number = 32) {
	return randomBytes(size).toString("hex");
}