import type { Metadata, Viewport } from 'next';
import type { CSSProperties } from 'react';
import { FehlerTexteAnbieter } from '@/components/lernapp/FehlerTexte';
import { ServiceWorkerAnmeldung } from '@/components/lernapp/ServiceWorkerAnmeldung';
import { funktionAn } from '@/lib/funktionen';
import { lernAdresse } from '@/lib/lernapp/adressen';
import { bauKennung } from '@/lib/lernapp/bau';
import { LERNAPP_FARBE } from '@/lib/lernapp/farben';
import { OBERFLAECHEN, richtung } from '@/lib/lernapp/kurse';
import { oberflaeche } from '@/lib/lernapp/seite';
import { lernTexte } from '@/lib/lernapp/texte';
import { indexierungGesperrt, NOINDEX } from '@/lib/seo/indexierung';
import { oeffentlicheAdresse } from '@/lib/umgebung';
import { ladeEinstellung } from '@/server/queries/einstellungen';
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

/**
 * Indexierungs-Schranke wie im Website-Layout (ADR 0049, E-047): Mit eingeschaltetem Konzept-Hinweis auf Vercel
 * `noindex, follow` – die Lern-App liegt auf derselben Domain und gehört bis dahin auch nicht in die Suche.
 */
export async function generateMetadata(): Promise<Metadata> {
  const sprache = await oberflaeche();
  const t = lernTexte(sprache);
  // Schalter `lernapp` aus: kein Manifest (die Seite ist ein 404, nichts zum Installieren; ADR 0035)
  const [an, { konzepthinweis }] = await Promise.all([funktionAn('lernapp'), ladeEinstellung('allgemein')]);
  return {
    metadataBase: new URL(oeffentlicheAdresse(process.env)),
    title: { default: t('meta.name'), template: `%s · ${t('meta.name')}` },
    description: t('meta.beschreibung'),
    applicationName: t('meta.name'),
    ...(an ? { manifest: `/lern-app/${sprache}/manifest.webmanifest` } : {}),
    icons: { icon: '/lern-app/symbole/symbol-192.png', apple: '/lern-app/symbole/apple-touch-icon.png' },
    appleWebApp: { capable: true, title: t('meta.kurzname'), statusBarStyle: 'default' },
    ...(indexierungGesperrt(konzepthinweis) ? { robots: NOINDEX } : {}),
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
 * `[ui]` (next/root-params, statisch), `<html lang dir>`; `data-bau` nennt die Bau-Kennung (Adresse des Workers der
 * Sprechübung, `?v=`, ADR 0042 Fortschreibung S5); `data-oberflaeche` nimmt die Oberfläche aus der globalen
 * Arabisch-Regel in `globals.css` heraus (ADR 0044 Nr. 4). Schriften wie die Website, dazu Noto Sans Arabic als
 * `--schrift-arabisch-ui`. Eigener Service Worker (Scope `/lern-app/`), Texte der Fehlerseite für `error.tsx`. Ist der
 * Schalter `lernapp` aus, rendert hier nur noch die 404 – ohne Anmeldung des Service Workers und ohne Manifest (ADR 0035:
 * „aus heißt 404“, Gegenprüfung L1).
 */
export default async function LernAppLayout({ children }: LayoutProps<'/lern-app/[ui]'>) {
  const sprache = await oberflaeche();
  const t = lernTexte(sprache);
  const an = await funktionAn('lernapp');
  return (
    <html
      lang={sprache}
      dir={richtung(sprache)}
      data-oberflaeche="lernapp"
      data-bau={bauKennung()}
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
        {an ? <ServiceWorkerAnmeldung ui={sprache} bau={bauKennung()} /> : null}
      </body>
    </html>
  );
}
