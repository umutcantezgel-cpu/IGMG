import { getLocale, getTranslations } from 'next-intl/server';
import type { CSSProperties, ReactNode } from 'react';
import type { Locale } from '@/i18n/routing';
import { brotkrumen } from '@/lib/seo/jsonld';
import { adresse } from '@/lib/seo/metadaten';
import { ladeEinstellung } from '@/server/queries/einstellungen';
import { Breadcrumbs, type PfadEintrag } from './Breadcrumbs';
import { Footer } from './Footer';
import { Header } from './Header';
import { JsonLd } from './JsonLd';
import { KonzeptHinweis } from './KonzeptHinweis';
import type { Bereich, SprachZiel } from './navigation';
import { PrayerTimesBar } from './PrayerTimesBar';
import { SeitenUebergang } from './SeitenUebergang';

/**
 * Einträge der BreadcrumbList mit den Namen der sichtbaren Brotkrumen (K-16). Eine Zwischenstufe ohne Adresse
 * (z. B. „Bildung“ ohne eigene Seite) entfällt; die aktuelle Seite als letzter Eintrag braucht keine Adresse.
 */
function brotkrumenEintraege(pfad: PfadEintrag[], sprache: Locale, startseite: string) {
  const eintraege: { name: string; url?: string }[] = [{ name: startseite, url: adresse('/', sprache) }];
  pfad.forEach((e, i) => {
    if (e.ziel !== undefined) eintraege.push({ name: e.label, url: adresse(e.ziel, sprache) });
    else if (i === pfad.length - 1) eintraege.push({ name: e.label });
  });
  return eintraege;
}

/** Name und Klasse des Inhalts im Seitenwechsel (B-05, L-E10). */
const SEITE = { viewTransitionName: 'seite', viewTransitionClass: 'seite' } as CSSProperties;

/**
 * Rahmen jeder öffentlichen Seite (MUSTER „Seite“): Sprunglink, Header, PrayerTimesBar, Breadcrumbs, Inhalt, Footer.
 * Jede Seite übergibt Bereich, aktuelle Seite und ihr Sprachziel ausdrücklich – so bleibt das HTML statisch
 * (kein usePathname). Ausnahmen nach Laufbuch D-16: keine Breadcrumbs auf der Startseite, keine Leiste auf Gebetszeiten.
 * `kompakteLeiste`: die Leiste als eine Zeile (Leseseiten wie `/quran/[sure]`, Sichtabnahme S-1).
 */
export async function Seitenrahmen({
  bereich,
  seite,
  sprachZiel,
  pfad,
  ohneLeiste = false,
  kompakteLeiste = false,
  children,
}: {
  bereich: Bereich;
  seite: string;
  sprachZiel: SprachZiel;
  pfad?: PfadEintrag[];
  ohneLeiste?: boolean;
  /** Leiste als eine Zeile „Nächstes Gebet · Zeit“ */
  kompakteLeiste?: boolean;
  children: ReactNode;
}) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('kopf');
  const th = await getTranslations('hinweis');
  const tp = await getTranslations('pfad');
  const { konzepthinweis } = await ladeEinstellung('allgemein');
  return (
    <>
      {/* Konzept-Hinweis vor dem Sprunglink: Nach dem Schließen (ohne vorherigen Fokus) setzt der Browser die
          Tab-Reihenfolge am Dialog fort – so am Seitenanfang beim Sprunglink statt hinter der Fußzeile (Z-08) */}
      {konzepthinweis ? (
        <KonzeptHinweis
          texte={{
            titelDe: th('titelDe'),
            titelTr: th('titelTr'),
            textDe: th('textDe'),
            textTr: th('textTr'),
            blockDe: th('blockDe'),
            blockTr: th('blockTr'),
            knopfDe: th('knopfDe'),
            knopfTr: th('knopfTr'),
            einmalDe: th('einmalDe'),
            einmalTr: th('einmalTr'),
            punkteDe: [th('de1'), th('de2'), th('de3'), th('de4')],
            punkteTr: [th('tr1'), th('tr2'), th('tr3'), th('tr4')],
          }}
        />
      ) : null}
      <a
        href="#inhalt"
        className="sr-only z-(--ebene-sprung) rounded-md bg-gruen-950 px-4 py-3 font-bold text-weiss focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:text-weiss"
      >
        {t('zumInhalt')}
      </a>
      <Header aktiv={bereich} aktuell={seite} sprachZiel={sprachZiel} />
      {ohneLeiste ? null : <PrayerTimesBar kompakt={kompakteLeiste} />}
      {pfad && pfad.length > 0 ? <Breadcrumbs pfad={pfad} /> : null}
      {pfad && pfad.length > 0 ? <JsonLd daten={brotkrumen(brotkrumenEintraege(pfad, sprache, tp('startseite')))} /> : null}
      <main id="inhalt" tabIndex={-1} className="outline-none">
        {/* B-05 Seitenwechsel: Kopf und Leiste stehen, der Inhalt blendet über (Klasse „seite“ in globals.css). Den
            Übergang startet SeitenUebergang; versteckte Seiten (Activity) sind nicht gerendert und nehmen nicht teil. */}
        <div data-seite style={SEITE}>
          {children}
        </div>
      </main>
      <Footer />
      <SeitenUebergang />
    </>
  );
}
