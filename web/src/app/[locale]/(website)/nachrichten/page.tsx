import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { NewsCard } from '@/components/website/NewsCard';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Ankuendigungen } from '@/components/website/nachrichten/Ankuendigungen';
import { NachrichtenFilter } from '@/components/website/nachrichten/NachrichtenFilter';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { cn } from '@/lib/utils';
import { ladeNachrichten } from '@/server/queries/nachrichten';

export const ensureStatic = 'navigation';

/** Filter-Kategorien in Design-Reihenfolge (News.dc.html CATS). Die Schlüssel sind die Werte des Enums nachricht_kategorie. */
const KATEGORIEN = ['ankuendigung', 'gemeinde', 'veranstaltung', 'bildung', 'religioes', 'soziales'] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nachrichten');
  return metadatenFuer({ pfad: '/nachrichten', titel: t('titel'), beschreibung: t('untertitel') });
}

/** Nachrichtenliste (design/News.dc.html, Blatt S06): Kategoriefilter, Beitragskarten, Leerzustand. */
export default async function NachrichtenSeite() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('nachrichten');
  const tp = await getTranslations('kopf');
  const tn = await getTranslations('nachricht');
  const liste = await ladeNachrichten();
  const zaehler: Record<string, number> = { alle: liste.length };
  for (const n of liste) zaehler[n.kategorie] = (zaehler[n.kategorie] ?? 0) + 1;
  const chips = [{ schluessel: 'alle', label: t('alle') }, ...KATEGORIEN.map((k) => ({ schluessel: k, label: t(`kategorien.${k}`) }))].map(
    (c) => {
      const anzahl = zaehler[c.schluessel] ?? 0;
      return { ...c, anzahl, zaehl: t('anzahl', { anzahl }) };
    },
  );
  // Einheitliches Raster: ohne Aufmacher (Kategorie-Filter und Listen mit weniger als vier Nachrichten)
  const einheitlich = (
    <ul className="grid raster-karten gap-6">
      {liste.map((n) => (
        <li key={n.id} data-kategorie={n.kategorie}>
          <NewsCard n={n} sprache={sprache} variante="standard" bild={n.bild} />
        </li>
      ))}
    </ul>
  );
  // Startform unter „Alle“ (ab vier Nachrichten): Aufmacher über zwei Spalten, daneben eine Liste in einem Rahmen mit
  // allen übrigen Nachrichten als Zeilen (ab md drei, ab lg auf Aufmacherhöhe). Ab md steht der Rest als Raster darunter;
  // ausgeblendete Fassungen (display:none) bekommen keinen Fokus und werden nicht vorgelesen.
  const [erste, ...ubrige] = liste;
  const startform =
    liste.length < 4 || !erste ? (
      einheitlich
    ) : (
      <>
        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          <div data-kategorie={erste.kategorie} className="min-w-0 lg:col-span-2">
            <NewsCard n={erste} sprache={sprache} variante="gross" bild={erste.bild} />
          </div>
          <ul className="grid min-w-0 overflow-hidden rounded-lg border border-linie bg-weiss shadow-s1 lg:grid-rows-3 menu:grid-rows-none">
            {ubrige.map((n, i) => (
              <li key={n.id} data-kategorie={n.kategorie} className={cn('border-t border-linie first:border-t-0', i >= 3 && 'md:hidden')}>
                <NewsCard n={n} sprache={sprache} variante="kompakt" rahmen={false} bild={n.bild} auszug />
              </li>
            ))}
          </ul>
        </div>
        {ubrige.length > 3 ? (
          <ul className="mt-6 grid raster-karten gap-6 max-md:hidden">
            {ubrige.slice(3).map((n) => (
              <li key={n.id} data-kategorie={n.kategorie}>
                <NewsCard n={n} sprache={sprache} variante="standard" bild={n.bild} />
              </li>
            ))}
          </ul>
        ) : null}
      </>
    );
  return (
    <Seitenrahmen bereich="moschee" seite="nachrichten" sprachZiel="/nachrichten" pfad={[{ label: t('titel') }]}>
      <PageHeader kennung={tp('moschee')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto max-w-(--container-inhalt) px-4 py-abschnitt-klein md:px-8">
        <Ankuendigungen sprache={sprache} />
        <NachrichtenFilter
          kategorien={chips}
          texte={{
            gruppe: t('gruppe'),
            alle: t('alle'),
            leerTitel: t('leerTitel'),
          }}
          leerSchritt={
            <Link
              href="/"
              className="inline-flex min-h-12 items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5.5 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 active:scale-98"
            >
              {tn('zurueck')}
            </Link>
          }
          kinder={startform}
          kinderGefiltert={einheitlich}
        />
      </div>
    </Seitenrahmen>
  );
}
