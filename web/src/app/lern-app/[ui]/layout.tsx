import type { Metadata, Viewport } from 'next';
import type { CSSProperties } from 'react';
import { FehlerTexteAnbieter } from '@/components/lernapp/FehlerTexte';
import { ServiceWorkerAnmeldung } from '@/components/lernapp/ServiceWorkerAnmeldung';
import { lernAdresse } from '@/lib/lernapp/adressen';
import { bauKennung } from '@/lib/lernapp/bau';
import { LERNAPP_FARBE } from '@/lib/lernapp/farben';
import { OBERFLAECHEN, richtung } from '@/lib/lernapp/kurse';
import { oberflaeche } from '@/lib/lernapp/seite';
import { lernTexte } from '@/lib/lernapp/texte';
import { oeffentlicheAdresse } from '@/lib/umgebung';
import { schriftKlassen } from '../../schriften';
import { schriftArabischUi } from '../schrift';
import '../../globals.css';

export function generateStaticParams() {
  return OBERFLAECHEN.map((sprache) => ({ ui: sprache }));
}

/**
 * Nur de/tr/ar (ADR 0037 Nr. 2 mit Fortschreibung S1): `dynamicParams = false` bricht unter Cache Components den Bau;
 * die Parameter-Zuordnung „not-found“ schließt die Werteliste (andere Werte fallen auf die nächste Route, die der Proxy
 * und die Fangroute `[ui]/[...rest]` mit 404 beantworten). Zusätzlich prüft das Layout selbst (`oberflaeche()`).
 */
export const unstable_paramMatching = { ui: 'not-found' } as const;

export async function generateMetadata(): Promise<Metadata> {
  const sprache = await oberflaeche();
  const t = lernTexte(sprache);
  return {
    metadataBase: new URL(oeffentlicheAdresse(process.env)),
    title: { default: t('meta.name'), template: `%s · ${t('meta.name')}` },
    description: t('meta.beschreibung'),
    applicationName: t('meta.name'),
    manifest: `/lern-app/${sprache}/manifest.webmanifest`,
    icons: { icon: '/lern-app/symbole/symbol-192.png', apple: '/lern-app/symbole/apple-touch-icon.png' },
    appleWebApp: { capable: true, title: t('meta.kurzname'), statusBarStyle: 'default' },
  };
}

export const viewport: Viewport = {
  themeColor: LERNAPP_FARBE.tiefgruen,
  width: 'device-width',
  initialScale: 1,
};

/**
 * In der arabischen Oberfläche stehen auch Überschriften in der Oberflächenschrift (ADR 0044 Nr. 2): Die Titelschrift
 * der Website hat keine arabischen Zeichen. `globals.css` setzt dort nur `--font-text`; bis die Regel dort steht,
 * setzt das Layout `--font-display` am Wurzelelement.
 */
const TITEL_ARABISCH = { '--font-display': 'var(--font-arabisch-ui)' } as CSSProperties;

/**
 * Wurzel-Layout der Lern-App (ADR 0037 Nr. 2) außerhalb von `[locale]`: Oberflächensprache aus dem Root-Parameter
 * `[ui]` (next/root-params, statisch), `<html lang dir>`; `data-oberflaeche` nimmt die Oberfläche aus der globalen
 * Arabisch-Regel in `globals.css` heraus (ADR 0044 Nr. 4). Schriften wie die Website, dazu Noto Sans Arabic als
 * `--schrift-arabisch-ui`. Eigener Service Worker (Scope `/lern-app/`), Texte der Fehlerseite für `error.tsx`.
 */
export default async function LernAppLayout({ children }: LayoutProps<'/lern-app/[ui]'>) {
  const sprache = await oberflaeche();
  const t = lernTexte(sprache);
  return (
    <html
      lang={sprache}
      dir={richtung(sprache)}
      data-oberflaeche="lernapp"
      className={`${schriftKlassen} ${schriftArabischUi.variable}`}
      style={sprache === 'ar' ? TITEL_ARABISCH : undefined}
    >
      <body>
        <FehlerTexteAnbieter
          texte={{
            titel: t('fehler.titel'),
            text: t('fehler.text'),
            nochmal: t('fehler.nochmal'),
            start: t('fehler.start'),
            startAdresse: lernAdresse(sprache),
          }}
        >
          {children}
        </FehlerTexteAnbieter>
        <ServiceWorkerAnmeldung ui={sprache} bau={bauKennung()} />
      </body>
    </html>
  );
}
