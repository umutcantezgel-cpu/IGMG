import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { NewsCard } from '@/components/website/NewsCard';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Ankuendigungen } from '@/components/website/nachrichten/Ankuendigungen';
import { NachrichtenFilter } from '@/components/website/nachrichten/NachrichtenFilter';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
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
  const liste = await ladeNachrichten();
  const zaehler: Record<string, number> = { alle: liste.length };
  for (const n of liste) zaehler[n.kategorie] = (zaehler[n.kategorie] ?? 0) + 1;
  const chips = [{ schluessel: 'alle', label: t('alle') }, ...KATEGORIEN.map((k) => ({ schluessel: k, label: t(`kategorien.${k}`) }))].map(
    (c) => {
      const anzahl = zaehler[c.schluessel] ?? 0;
      return { ...c, anzahl, zaehl: t('anzahl', { anzahl }) };
    },
  );
  return (
    <Seitenrahmen bereich="moschee" seite="nachrichten" sprachZiel="/nachrichten" pfad={[{ label: tp('neuigkeiten') }]}>
      <PageHeader kennung={tp('moschee')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto max-w-(--container-inhalt) px-4 pt-6 pb-12 md:px-8 md:pt-12 md:pb-24">
        <Ankuendigungen sprache={sprache} />
        <NachrichtenFilter
          kategorien={chips}
          texte={{
            gruppe: t('gruppe'),
            neueste: t('neueste'),
            alle: t('alle'),
            leerTitel: t('leerTitel'),
            leerText: t('leerText'),
          }}
          kinder={
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-6">
              {liste.map((n) => (
                <li key={n.id} data-kategorie={n.kategorie}>
                  <NewsCard n={n} sprache={sprache} variante="standard" />
                </li>
              ))}
            </ul>
          }
        />
      </div>
    </Seitenrahmen>
  );
}
