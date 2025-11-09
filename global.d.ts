import { routing } from '@/i18n/routing';
// 翻译文件
import common from '@messages/zh-CN/common.json';
import login from '@messages/zh-CN/login.json';
import metadata from '@messages/zh-CN/metadata.json';
import register from '@messages/zh-CN/register.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: {
      common: typeof common;
      login: typeof login;
      metadata: typeof metadata;
      register: typeof register;
    }
  }
}
