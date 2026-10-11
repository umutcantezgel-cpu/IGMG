import type { Metadata, Viewport } from 'next';
import { ServiceWorkerAnmeldung } from '@/components/website/ServiceWorkerAnmeldung';
import { getTranslations } from 'next-intl/server';
import { locale } from 'next/root-params';
import { routing } from '@/i18n/routing';
import { schriftKlassen } from '../schriften';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((l) => ({ locale: l }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  return {
    metadataBase: new URL(process.env.APP_URL ?? 'http://localhost:3000'),
    title: { default: t('titel'), template: `%s · ${t('titel')}` },
    description: t('beschreibung'),
    applicationName: t('titel'),
    icons: { icon: '/symbole/symbol-192.png', apple: '/symbole/apple-touch-icon.png' },
  };
}

export const viewport: Viewport = {
  themeColor: '#0e3929',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Wurzel-Layout aller Seiten. Die Sprache kommt aus dem Root-Parameter (statisch).
 * Öffentliche Seiten laden kein next-intl im Browser (K-12, JS-Budget): Links rechnet `src/i18n/link.tsx` auf
 * dem Server aus, Client-Komponenten bekommen Texte und Adressen als Props. Nur die Verwaltung hat einen
 * NextIntlClientProvider (eigenes Layout).
 */
export default async function WurzelLayout({ children }: LayoutProps<'/[locale]'>) {
  const sprache = await locale();
  return (
    <html lang={sprache} className={schriftKlassen}>
      <body>
        {children}
        <ServiceWorkerAnmeldung />
      </body>
    </html>
  );
}
