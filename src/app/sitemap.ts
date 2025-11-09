import type { MetadataRoute } from "next";
import { routing } from "@i18n/routing";
import { formatPath, splicedPathUrl } from "@utils/urlTools";
import { db } from "@utils/db";
import { safeLogger } from "@utils/safeLogger";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[0]["changeFrequency"]>;

interface StaticPageEntry {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

interface PageMetadataRecord {
  id: number;
  path: string;
  locale: string;
  update_at: Date | null;
  change_frequency: ChangeFrequency | null;
  priority: number | null;
}

// 静态路径列表
const staticPages: StaticPageEntry[] = [
  { path: "/", changeFrequency: "daily", priority: 1.0 },
  { path: "/login", changeFrequency: "monthly", priority: 0.4 },
  { path: "/about", changeFrequency: "yearly", priority: 0.3 },
];

const locales = routing.locales;
const defaultLocale = routing.defaultLocale;

/**
 * 批量拉取页面元数据
 */
async function getAllPageMetadata(staticPages: StaticPageEntry[]): Promise<Map<string, PageMetadataRecord>> {

  const allPaths = locales.flatMap((locale) => staticPages.map((p) => formatPath(`${locale}/${p.path}`)));
  
  try {
    const allMetadata = await db.page_metadata.findMany({
      where: { path: { in: allPaths } },
      select: {
        id: true,
        path: true,
        locale: true,
        update_at: true,
        change_frequency: true,
        priority: true,
      },
    });
    
    return new Map(allMetadata.map((m) => [m.path, m]));
  } catch (err) {
    safeLogger.logError("DB batch fetch failed.", err);
    return new Map();
  }
}

/**
 * 获取或创建单页面元数据（并发安全）
 */
async function getOrCreatePageMetadata(
    formattedPath: string,
    locale: string,
    changeFrequency: ChangeFrequency,
    priority: number
): Promise<PageMetadataRecord | undefined> {
  const existing = await db.page_metadata.findUnique({ where: { path: formattedPath } });
  if (existing) return existing;
  
  try {
    return await db.page_metadata.create({
      data: { path: formattedPath, locale, change_frequency: changeFrequency, priority },
    });
  } catch (err) {
    safeLogger.logError(`DB create failed for ${formattedPath}`, err);
    return undefined;
  }
}

/**
 * sitemap 主函数
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];
  const metadataMap = await getAllPageMetadata(staticPages);
  
  // 并发生成所有页面的 sitemap 条目
  const results = await Promise.allSettled(
      staticPages.flatMap(({ path, changeFrequency, priority }) =>
          locales.map(async (locale) => {
            const formattedPath = formatPath(`${locale}/${path}`);
            const currentUrl = splicedPathUrl(formattedPath);
            
            let record = metadataMap.get(formattedPath);
            if (!record) {
              record = await getOrCreatePageMetadata(formattedPath, locale, changeFrequency, priority);
              if (record) metadataMap.set(formattedPath, record);
            }
            
            if (!record) return null;
            
            // 构建 alternates
            const languagesAlternates: Record<string, string> = {};
            for (const otherLocale of locales) {
              languagesAlternates[otherLocale] = splicedPathUrl(formatPath(`${otherLocale}/${path}`));
            }
            languagesAlternates["x-default"] = splicedPathUrl(formatPath(`${defaultLocale}/${path}`));
            
            return {
              url: currentUrl,
              lastModified: record.update_at ?? undefined,
              changeFrequency: record.change_frequency ?? changeFrequency,
              priority: record.priority ?? priority,
              alternates: { languages: languagesAlternates },
            } satisfies MetadataRoute.Sitemap[number];
          })
      )
  );
  
  for (const res of results) {
    if (res.status === "fulfilled" && res.value) sitemapEntries.push(res.value);
  }
  
  return sitemapEntries;
}
