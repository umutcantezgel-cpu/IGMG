import { CalendarPlus } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { EventCard } from '@/components/website/EventCard';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { VeranstaltungsFilter } from '@/components/website/veranstaltungen/VeranstaltungsFilter';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeVeranstaltungen } from '@/server/queries/veranstaltungen';

export const ensureStatic = 'navigation';

const KATEGORIEN = ['gebet', 'bildung', 'gemeinde', 'kultur', 'jugend', 'frauen'] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('veranstaltungen');
  return metadatenFuer({ pfad: '/veranstaltungen', titel: t('titel'), beschreibung: t('untertitel') });
}

/** Veranstaltungen (design/Events.dc.html, Blatt S04): kommende und wiederkehrende Termine, Kategoriefilter, Leerzustand. */
export default async function VeranstaltungenSeite() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('veranstaltungen');
  const tk = await getTranslations('karten');
  const tp = await getTranslations('kopf');
  const ts = await getTranslations('start');
  const liste = (await ladeVeranstaltungen()).filter((v) => !v.vergangen);
  const zaehler: Record<string, number> = { alle: liste.length };
  for (const v of liste) zaehler[v.kategorie] = (zaehler[v.kategorie] ?? 0) + 1;
  return (
    <Seitenrahmen bereich="moschee" seite="veranstaltungen" sprachZiel="/veranstaltungen" pfad={[{ label: tp('veranstaltungen') }]}>
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto max-w-(--container-inhalt) px-4 py-abschnitt-klein md:px-8">
        <VeranstaltungsFilter
          kategorien={KATEGORIEN.map((k) => ({ schluessel: k, label: tk(`kat_${k}`) }))}
          zaehler={zaehler}
          texte={{
            gruppe: t('kategorie'),
            alle: t('alle'),
            kommend: t('kommend'),
            leerTitel: t('leerTitel'),
            leerText: t('leerText'),
            keineTermine: ts('keineVeranstaltungen'),
          }}
          kinder={
            <ul className="grid raster-karten gap-6">
              {liste.map((v) => (
                <li key={v.id} data-kategorie={v.kategorie}>
                  <EventCard v={v} sprache={sprache} variante="liste" bild={v.bild} />
                </li>
              ))}
            </ul>
          }
        />
        <p className="mt-10">
          <a
            href={`/api/ical/${sprache}/veranstaltungen`}
            className="inline-flex min-h-12 items-center gap-2 font-bold text-gruen-700 underline underline-offset-4"
          >
            <CalendarPlus aria-hidden className="size-5" />
            {t('abo')}
          </a>
        </p>
      </div>
    </Seitenrahmen>
  );
}
