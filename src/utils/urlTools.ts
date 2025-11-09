import getBaseUrl from "@utils/siteUrl";
import { safeLogger } from "@utils/safeLogger";

const baseUrl = getBaseUrl();

/** 格式化相对URL路径。
 * e.g. path//page => /path/page/
 * @param path - 相对URL路径
 * @return - 首尾有'/'的相对URL路径
 */
export function formatPath(path: string) {
  if (!/^[A-Za-z0-9\-._~/%/]+$/.test(path)) {
    safeLogger.error(`Invalid characters found in path: ${path}`);
    throw new Error(`Invalid characters found in path.`);
  }
  
  // 去除首尾斜杠
  path = path.replace(/^\/+/, "").replace(/\/+$/, "");
  // 折叠中间连续斜杠
  path = path.replace(/\/{2,}/g, "/");
  // 补上头尾斜杠
  path = path.replace(/^\/?/, "/").replace(/\/?$/, "/");
  
  return path;
}

/** 拼接路径为完整URL。
 * BaseURL 由 getBaseUrl() 提供。
 *
 * @param path
 */
export function splicedPathUrl(path: string) {
  path = formatPath(path);
  return `${baseUrl}${path}`;
}
