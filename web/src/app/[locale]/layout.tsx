import type { Metadata, Viewport } from 'next';
import { ServiceWorkerAnmeldung } from '@/components/website/ServiceWorkerAnmeldung';
import { getTranslations } from 'next-intl/server';
import { locale } from 'next/root-params';
import { routing } from '@/i18n/routing';
import { indexierungGesperrt, NOINDEX } from '@/lib/seo/indexierung';
import { oeffentlicheAdresse } from '@/lib/umgebung';
import { ladeEinstellung } from '@/server/queries/einstellungen';
import { schriftKlassen } from '../schriften';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((l) => ({ locale: l }));
}

/**
 * Standard-Metadaten aller Seiten. Indexierungs-Schranke (ADR 0049): Mit eingeschaltetem Konzept-Hinweis (Einstellung
 * „allgemein“, wie im Seitenrahmen) auf Vercel `noindex, follow` – Seiten ohne eigene robots-Angabe erben sie.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [t, { konzepthinweis }] = await Promise.all([getTranslations('meta'), ladeEinstellung('allgemein')]);
  return {
    metadataBase: new URL(oeffentlicheAdresse(process.env)),
    title: { default: t('titel'), template: `%s · ${t('titel')}` },
    description: t('beschreibung'),
    applicationName: t('titel'),
    icons: { icon: '/symbole/symbol-192.png', apple: '/symbole/apple-touch-icon.png' },
    ...(indexierungGesperrt(konzepthinweis) ? { robots: NOINDEX } : {}),
  };
}

export const viewport: Viewport = {
  // = --color-gruen-950: Browser-Metadaten verlangen einen Farbwert als Text, CSS-Variablen gelten hier nicht
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
