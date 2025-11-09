import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@i18n/routing';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Metadata} from 'next';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata(props: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'metadata'
  });
  
  return {
    title: t('title'),
    description: t('description'),
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/favicon.svg'
    }
  };
}

export default async function LocaleLayout({
                                             children,
                                             params
}: LayoutProps<'/[locale]'>) {
  
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  
  setRequestLocale(locale);
  
  return (
      <html className="h-full" lang={locale}>
      <body>
      <NextIntlClientProvider>
        {children}
      </NextIntlClientProvider>
      </body>
      </html>
  );
}