import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { ui } from 'next/root-params';
import { ServiceWorkerAnmeldung } from '@/components/lernapp/ServiceWorkerAnmeldung';
import { OBERFLAECHEN, istOberflaeche, lernTexte, richtung } from '@/lib/lernapp/texte';
import { oeffentlicheAdresse } from '@/lib/umgebung';
import { schriftKlassen } from '../../schriften';
import '../../globals.css';

export function generateStaticParams() {
  return OBERFLAECHEN.map((sprache) => ({ ui: sprache }));
}

/**
 * Nur de/tr/ar (ADR 0037 Nr. 2). `dynamicParams = false` bricht unter Cache Components den Bau ab („not compatible
 * with nextConfig.cacheComponents“, Spike L0-S1); Next 16.4 schließt die Werteliste stattdessen über die
 * Parameter-Zuordnung „not-found“: andere Werte antworten mit 404, ohne zu rendern. Zusätzlich prüft das Layout.
 */
export const unstable_paramMatching = { ui: 'not-found' } as const;

export async function generateMetadata(): Promise<Metadata> {
  const wert = await ui();
  const sprache = istOberflaeche(wert) ? wert : 'de';
  const t = lernTexte(sprache);
  return {
    metadataBase: new URL(oeffentlicheAdresse(process.env)),
    title: { default: t('meta.name'), template: `%s · ${t('meta.name')}` },
    description: t('meta.beschreibung'),
    applicationName: t('meta.name'),
    manifest: `/lern-app/${sprache}/manifest.webmanifest`,
    icons: { icon: '/symbole/symbol-192.png', apple: '/symbole/apple-touch-icon.png' },
    // Spike L0-S1: Platzhalterseiten, nicht indexieren
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  // = --color-gruen-950 wie die Website (Browser-Metadaten verlangen einen Farbwert als Text)
  themeColor: '#0e3929',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Wurzel-Layout der Lern-App (ADR 0037 Nr. 2) außerhalb von `[locale]`: Oberflächensprache aus dem Root-Parameter
 * `[ui]` (next/root-params, statisch), `<html lang dir>`; `data-oberflaeche` nimmt die Oberfläche aus der globalen
 * Arabisch-Regel in `globals.css` heraus (ADR 0044 Nr. 4). Eigener Service Worker mit Scope `/lern-app/`.
 */
export default async function LernAppLayout({ children }: LayoutProps<'/lern-app/[ui]'>) {
  const sprache = await ui();
  if (!istOberflaeche(sprache)) notFound();
  return (
    <html lang={sprache} dir={richtung(sprache)} data-oberflaeche="lernapp" className={schriftKlassen}>
      <body>
        {children}
        <ServiceWorkerAnmeldung />
      </body>
    </html>
  );
}
