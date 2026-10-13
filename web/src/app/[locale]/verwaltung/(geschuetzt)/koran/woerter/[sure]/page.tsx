import { PencilLine } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { schriftQuran } from '@/app/schriften-quran';
import { Button } from '@/components/ui/button';
import { KoranNavigation, LeerPille, StatusPille, ZurueckLink } from '@/components/verwaltung/koran/Teile';
import { QURAN_RECHTE, verlangeKoranZugang } from '@/components/verwaltung/koran/zugang';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { ladeSureWoerter, WORT_FILTER, type BedeutungKurz, type SurenWort } from '@/server/queries/verwaltung/koran';

/**
 * Werkstatt einer Sure (ADR 0030): Wortformen in der Reihenfolge ihres ersten Vorkommens mit dem Stand der Bedeutung
 * de/tr; Filter „ohne geprüfte Bedeutung“ und „zur Prüfung“; 40 je Seite. Arabisch nur aus der Datenbank.
 */
export default async function SureWerkstattSeite({ params, searchParams }: PageProps<'/[locale]/verwaltung/koran/woerter/[sure]'>) {
  await verlangeKoranZugang(QURAN_RECHTE);
  const { sure: roh } = await params;
  const suche = await searchParams;
  const eins = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
  const filter = WORT_FILTER.find((f) => f === eins(suche.ansicht)) ?? 'alle';
  const seite = /^\d{1,4}$/.test(eins(suche.seite)) ? Number(eins(suche.seite)) : 1;
  const nr = /^\d{1,3}$/.test(roh) ? Number(roh) : 0;
  const [t, daten] = await Promise.all([getTranslations('verwaltung.koran'), ladeSureWoerter(nr, filter, seite)]);
  const zurueck = <ZurueckLink href="/verwaltung/koran/woerter" text={t('woerter.zurUebersicht')} />;
  if (!daten)
    return (
      <div className="flex flex-col gap-6">
        {zurueck}
        <ListenLeer text={t('woerter.leer')} />
      </div>
    );
  const { sure, woerter, zahlen, seiten } = daten;
  const aktuell = Math.min(Math.max(1, seite), seiten);
  const stelle = (w: SurenWort) => `${sure.nr}:${w.vers} · ${w.pos}`;
  const pfad = (w: SurenWort) => `/verwaltung/koran/woerter/${sure.nr}/${w.formId}`;
  const seitenPfad = (s: number) => `/verwaltung/koran/woerter/${sure.nr}?ansicht=${filter}&seite=${s}`;
  const bedeutung = (b: BedeutungKurz, sprache: 'de' | 'tr') =>
    b ? (
      <span className="flex flex-col items-start gap-1">
        <StatusPille status={b.status} />
        <span lang={sprache} className="line-clamp-2 text-16">
          {b.bedeutung}
        </span>
      </span>
    ) : (
      <LeerPille text={t('woerter.nochNicht')} />
    );
  const wort = (w: SurenWort) => (
    <span lang="ar" dir="rtl" className="font-quran text-arabisch-2">
      {w.textAr}
    </span>
  );
  const bearbeiten = (w: SurenWort) => (
    <Button asChild variant="outline">
      <NextLink href={pfad(w)} aria-label={t('woerter.bearbeitenAria', { stelle: stelle(w) })}>
        <PencilLine aria-hidden />
        {t('woerter.bearbeiten')}
      </NextLink>
    </Button>
  );

  return (
    <div className={`flex flex-col gap-8 ${schriftQuran.variable}`}>
      {zurueck}
      <VerwaltungsKopf
        kennung={t('kennung')}
        titel={t('woerter.sureTitel', { nr: sure.nr, name: sure.umschrift || sure.nr })}
        einleitung={t('woerter.sureEinleitung', { formen: zahlen.alle, verse: sure.verse })}
        aktion={
          <span lang="ar" dir="rtl" className="font-quran text-arabisch-2">
            {sure.nameAr}
          </span>
        }
      />
      <KoranNavigation aktiv="woerter" />

      <section aria-labelledby="sure-woerter" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="sure-woerter" className="text-24 font-bold">
            {t('woerter.wortTabelle')}
          </h2>
          <form method="get" className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5 font-bold">
              {t('woerter.filter')}
              <select
                name="ansicht"
                defaultValue={filter}
                className="min-h-12 rounded-md border border-rand bg-weiss px-3.5 text-18 font-normal text-tinte"
              >
                <option value="alle">{t('woerter.filterAlle', { anzahl: zahlen.alle })}</option>
                <option value="fehlt">{t('woerter.filterFehlt', { anzahl: zahlen.fehlt })}</option>
                <option value="pruefung">{t('woerter.filterPruefung', { anzahl: zahlen.pruefung })}</option>
              </select>
            </label>
            <Button type="submit" variant="outline">
              {t('woerter.filterAnwenden')}
            </Button>
          </form>
        </div>
        {woerter.length === 0 ? (
          <ListenLeer text={t('woerter.leerFilter')} />
        ) : (
          <TabellenRahmen
            beschriftung={t('woerter.wortTabelle')}
            mobil={
              <ul className="flex flex-col gap-3">
                {woerter.map((w) => (
                  <ListenKarte
                    key={w.formId}
                    titel={wort(w)}
                    angaben={[
                      { label: t('woerter.spalteStelle'), wert: stelle(w), zahl: true },
                      { label: t('woerter.spalteVorkommen'), wert: t('woerter.vorkommenText', { hier: w.hier, gesamt: w.vorkommen }) },
                      { label: t('sprache.de'), wert: bedeutung(w.de, 'de') },
                      { label: t('sprache.tr'), wert: bedeutung(w.tr, 'tr') },
                    ]}
                    aktionen={bearbeiten(w)}
                  />
                ))}
              </ul>
            }
          >
            <table className="w-full text-start">
              <thead className="bg-sand text-16">
                <tr>
                  <th scope="col" className="px-4 py-3 text-start">
                    {t('woerter.spalteWort')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-start">
                    {t('woerter.spalteStelle')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-start">
                    {t('woerter.spalteVorkommen')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-start">
                    {t('sprache.de')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-start">
                    {t('sprache.tr')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-end">
                    <span className="sr-only">{t('woerter.spalteAktion')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {woerter.map((w) => (
                  <tr key={w.formId} className="border-t border-linie align-top">
                    <th scope="row" className="px-4 py-2 text-start font-normal">
                      {wort(w)}
                    </th>
                    <td className="px-4 py-3 tabular-nums">{stelle(w)}</td>
                    <td className="px-4 py-3 text-16 tabular-nums">{t('woerter.vorkommenText', { hier: w.hier, gesamt: w.vorkommen })}</td>
                    <td className="max-w-64 px-4 py-3">{bedeutung(w.de, 'de')}</td>
                    <td className="max-w-64 px-4 py-3">{bedeutung(w.tr, 'tr')}</td>
                    <td className="px-4 py-3 text-end">{bearbeiten(w)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabellenRahmen>
        )}
        {seiten > 1 ? (
          <nav aria-label={t('woerter.seitenNav')} className="flex flex-wrap items-center justify-between gap-3">
            {aktuell > 1 ? (
              <Button asChild variant="outline">
                <NextLink href={seitenPfad(aktuell - 1)}>{t('woerter.zurueck')}</NextLink>
              </Button>
            ) : (
              <span />
            )}
            <span className="text-16 text-tinte-2 tabular-nums">{t('woerter.seite', { seite: aktuell, seiten })}</span>
            {aktuell < seiten ? (
              <Button asChild variant="outline">
                <NextLink href={seitenPfad(aktuell + 1)}>{t('woerter.weiter')}</NextLink>
              </Button>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </section>
    </div>
  );
}
