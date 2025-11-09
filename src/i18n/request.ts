import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
      ? requested
      : routing.defaultLocale;

  const messages = {
    common: (await import(`@messages/${locale}/common.json`)).default,
    login: (await import(`@messages/${locale}/login.json`)).default,
    metadata: (await import(`@messages/${locale}/metadata.json`)).default,
    register: (await import(`@messages/${locale}/register.json`)).default,
  };
  
  return {
    locale,
    messages,
    timezone: 'Asia/Shanghai'
  };
});