import {safeLogger} from "@utils/safeLogger";

let baseUrl: string | undefined = undefined;
const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_BASE_URL?.trim().replace(/\/$/, '');

/** 返回网站 URL 前缀，无尾斜杠
 * e.g. https://example.com
 * @returns - 合法的网站 URL
 */
export default function getBaseUrl() {
  // 如果 siteUrl 非空就返回
  if (baseUrl) return baseUrl;
  
  // 检测是否为空
  if (!rawBaseUrl) {
    safeLogger.error("The environment variable 'NEXT_PUBLIC_SITE_BASE_URL' is empty or does not exist.");
    throw new Error("The environment variable 'NEXT_PUBLIC_SITE_BASE_URL' is empty or does not exist.");
  }
  
  // 检测是否合法
  let url: URL;
  try {
    url = new URL(rawBaseUrl);
  } catch (err) {
    safeLogger.logError("The environment variable 'NEXT_PUBLIC_SITE_BASE_URL' is invalid.", err);
    throw new Error("The environment variable 'NEXT_PUBLIC_SITE_BASE_URL' is invalid.");
  }
  
  // 检测协议是否合法
  if (!(url.protocol === "http:" || url.protocol === "https:")) {
    safeLogger.error("The environment variable 'NEXT_PUBLIC_SITE_BASE_URL' must begin with the http:// or https:// scheme.");
    throw new Error("The environment variable 'NEXT_PUBLIC_SITE_BASE_URL' must begin with the http:// or https:// scheme.");
  }
  
  // 写入结果
  baseUrl = rawBaseUrl;
  
  return baseUrl;
}
