import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { EventCard } from '@/components/website/EventCard';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { KalenderAbo } from '@/components/website/veranstaltungen/KalenderAbo';
import { VeranstaltungsFilter } from '@/components/website/veranstaltungen/VeranstaltungsFilter';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { type VeranstaltungsDaten, ladeVeranstaltungen } from '@/server/queries/veranstaltungen';

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
  // Trefferzahl je Filter („5 Veranstaltungen“), rechts der Chips als Live-Region
  const zaehlTexte: Record<string, string> = Object.fromEntries(
    ['alle', ...KATEGORIEN].map((k) => [k, t('anzahl', { anzahl: zaehler[k] ?? 0 })]),
  );
  // Ein Aufmacher nur ab drei Terminen; er ist der erste der chronologisch sortierten Termine (neutral gegenüber den Organisationen).
  // Unter „Alle“ steht er über zwei Spalten (ab lg), die Termine danach im Raster; eine Kategorie zeigt nur das Raster.
  // Telefon (H-C03): jeder weitere Termin als Kompaktzeile, ab md die Karte – eine Fassung, die je nach Breite umschaltet
  // (EventCard Variante liste, H-L01: vorher zwei Fassungen je Termin im HTML).
  const fassungen = (v: VeranstaltungsDaten) => <EventCard v={v} sprache={sprache} variante="liste" bild={v.bild} />;
  const einheitlich = (
    <ul className="grid raster-karten gap-3 md:gap-6">
      {liste.map((v) => (
        <li key={v.id} data-kategorie={v.kategorie}>
          {fassungen(v)}
        </li>
      ))}
    </ul>
  );
  const startform =
    liste.length < 3 ? (
      einheitlich
    ) : (
      <ul className="grid raster-karten gap-3 md:gap-6">
        {liste.map((v, i) => (
          <li key={v.id} data-kategorie={v.kategorie} className={i === 0 ? 'lg:col-span-2' : undefined}>
            {i === 0 ? <EventCard v={v} sprache={sprache} variante="aufmacher" bild={v.bild} /> : fassungen(v)}
          </li>
        ))}
      </ul>
    );
  return (
    <Seitenrahmen bereich="moschee" seite="veranstaltungen" sprachZiel="/veranstaltungen" pfad={[{ label: tp('veranstaltungen') }]}>
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto max-w-(--container-inhalt) px-4 py-abschnitt-klein md:px-8">
        <VeranstaltungsFilter
          kategorien={KATEGORIEN.map((k) => ({ schluessel: k, label: tk(`kat_${k}`) }))}
          zaehler={zaehler}
          zaehlTexte={zaehlTexte}
          texte={{
            gruppe: t('kategorie'),
            alle: t('alle'),
            leerTitel: t('leerTitel'),
            leerText: t('leerText'),
            keineTermine: ts('keineVeranstaltungen'),
          }}
          kinder={startform}
          kinderGefiltert={einheitlich}
        />
        <div className="mt-10">
          <KalenderAbo sprache={sprache} />
        </div>
      </div>
    </Seitenrahmen>
  );
}
