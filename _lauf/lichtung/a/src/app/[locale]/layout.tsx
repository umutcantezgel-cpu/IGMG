import { NextIntlClientProvider } from 'next-intl';
import { locale } from 'next/root-params';
import { routing } from '@/i18n/routing';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((l) => ({ locale: l }));
}

export default async function RootLayout({ children }: LayoutProps<'/[locale]'>) {
  return (
    <html lang={await locale()}>
      <body>
        <NextIntlClientProvider messages={{}}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
