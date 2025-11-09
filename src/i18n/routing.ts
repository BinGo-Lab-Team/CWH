// routing.ts
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['zh-CN', 'en-US'],
  defaultLocale: 'zh-CN',
  localePrefix: 'always',
  localeCookie: true,
  alternateLinks: true,
  localeDetection: true
});
