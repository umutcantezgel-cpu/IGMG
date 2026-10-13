import { ListOrdered, PencilLine, Search } from 'lucide-react';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { eingabe } from '@/components/verwaltung/Feld';
import { KARTE, KoranNavigation, StatusPille } from '@/components/verwaltung/koran/Teile';
import { HADITH_RECHTE, verlangeKoranZugang } from '@/components/verwaltung/koran/zugang';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { hadithNummer, HADITH_SPRACHEN } from '@/lib/validierung/koran';
import { HADITH_FILTER, ladeHadithVerwaltung, type HadithUebersetzungZeile } from '@/server/queries/verwaltung/koran';

/**
 * Verwaltung › Koran & Hadith › Hadith (AUFTRAG 3.3, ADR 0030, MN-06): Stand der Übersetzungen je Sprache, Liste nach
 * Freigabestand, Sprung zu einer Hadith-Nummer (nur importierte Hadithe) und zu den kuratierten Listen.
 */
export default async function HadithVerwaltungSeite({ searchParams }: PageProps<'/[locale]/verwaltung/koran/hadith'>) {
  await verlangeKoranZugang(HADITH_RECHTE);
  const suche = await searchParams;
  const eins = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
  const nummer = hadithNummer.safeParse(eins(suche.nummer));
  if (nummer.success) redirect(`/verwaltung/koran/hadith/${nummer.data}`);
  const filter = HADITH_FILTER.find((f) => f === eins(suche.ansicht)) ?? 'offen';
  const [t, d] = await Promise.all([getTranslations('verwaltung.koran'), ladeHadithVerwaltung(filter)]);
  const sprache = (s: string) => ((HADITH_SPRACHEN as readonly string[]).includes(s) ? t(`sprache.${s}`) : s);
  const bearbeiten = (z: HadithUebersetzungZeile) => (
    <Button asChild variant="outline">
      <NextLink
        href={`/verwaltung/koran/hadith/${z.nummer}#uebersetzung-${z.sprache}`}
        aria-label={t('hadith.bearbeitenAria', { nummer: z.nummer, sprache: sprache(z.sprache) })}
      >
        <PencilLine aria-hidden />
        {t('hadith.bearbeiten')}
      </NextLink>
    </Button>
  );

  return (
    <div className="flex flex-col gap-8">
      <VerwaltungsKopf
        kennung={t('kennung')}
        titel={t('hadith.titel')}
        einleitung={t('hadith.einleitung')}
        aktion={
          <Button asChild variant="secondary">
            <NextLink href="/verwaltung/koran/hadith/listen">
              <ListOrdered aria-hidden />
              {t('hadith.listenLink')}
            </NextLink>
          </Button>
        }
      />
      <KoranNavigation aktiv="hadith" />
      {!d.sammlung ? (
        <ListenLeer text={t('hadith.keinImport')} />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <section aria-labelledby="hadith-stand" className={KARTE}>
              <h2 id="hadith-stand" className="text-24 font-bold">
                {t('hadith.standTitel')}
              </h2>
              <p className="text-16 text-tinte-2">
                {t('hadith.sammlung', { anzahl: d.sammlung.anzahl, version: d.sammlung.version.slice(0, 12) })}
              </p>
              <p className="text-16 text-tinte-2">{d.sammlung.freigegeben ? t('hadith.gesamtFrei') : t('hadith.gesamtNichtFrei')}</p>
              {Object.keys(d.zahlen).length === 0 ? (
                <p className="text-16">{t('hadith.standLeer')}</p>
              ) : (
                <ul className="flex flex-col gap-1 text-16 tabular-nums">
                  {Object.entries(d.zahlen).map(([s, z]) => (
                    <li key={s}>
                      {t('hadith.standSprache', { sprache: sprache(s), geprueft: z.geprueft, offen: z.zur_pruefung, entwurf: z.entwurf })}
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section aria-labelledby="hadith-oeffnen" className={KARTE}>
              <h2 id="hadith-oeffnen" className="text-24 font-bold">
                {t('hadith.oeffnenTitel')}
              </h2>
              <form method="get" className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1.5 font-bold">
                  {t('hadith.nummer')}
                  <input
                    name="nummer"
                    inputMode="decimal"
                    autoComplete="off"
                    maxLength={8}
                    aria-describedby="hadith-nummer-hinweis"
                    className={`${eingabe} w-40`}
                  />
                </label>
                <Button type="submit">
                  <Search aria-hidden />
                  {t('hadith.oeffnen')}
                </Button>
              </form>
              <p id="hadith-nummer-hinweis" className="text-16 text-tinte-2">
                {t('hadith.nummerHinweis')}
              </p>
            </section>
          </div>

          <section aria-labelledby="hadith-liste" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="hadith-liste" className="text-24 font-bold">
                {t('hadith.listeTitel')}
              </h2>
              <form method="get" className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1.5 font-bold">
                  {t('hadith.filter')}
                  <select name="ansicht" defaultValue={filter} className={`${eingabe} font-normal`}>
                    <option value="offen">{t('hadith.filterOffen')}</option>
                    <option value="zur_pruefung">{t('hadith.filterPruefung')}</option>
                    <option value="geprueft">{t('hadith.filterGeprueft')}</option>
                    <option value="alle">{t('hadith.filterAlle')}</option>
                  </select>
                </label>
                <Button type="submit" variant="outline">
                  {t('hadith.filterAnwenden')}
                </Button>
              </form>
            </div>
            {d.zeilen.length === 0 ? (
              <ListenLeer text={t('hadith.leer')} />
            ) : (
              <TabellenRahmen
                beschriftung={t('hadith.tabelle')}
                mobil={
                  <ul className="flex flex-col gap-3">
                    {d.zeilen.map((z) => (
                      <ListenKarte
                        key={`${z.nummer}-${z.sprache}`}
                        titel={t('hadith.detailTitel', { nummer: z.nummer })}
                        angaben={[
                          { label: t('hadith.spalteSprache'), wert: sprache(z.sprache) },
                          { label: t('hadith.spalteText'), wert: <span lang={z.sprache}>{z.auszug}</span> },
                          { label: t('hadith.spalteUebersetzer'), wert: z.uebersetzer },
                          { label: t('hadith.spalteStatus'), wert: <StatusPille status={z.status} /> },
                        ]}
                        aktionen={bearbeiten(z)}
                      />
                    ))}
                  </ul>
                }
              >
                <table className="w-full text-start">
                  <thead className="bg-sand text-16">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-start">
                        {t('hadith.spalteNummer')}
                      </th>
                      <th scope="col" className="px-4 py-3 text-start">
                        {t('hadith.spalteSprache')}
                      </th>
                      <th scope="col" className="px-4 py-3 text-start">
                        {t('hadith.spalteText')}
                      </th>
                      <th scope="col" className="px-4 py-3 text-start">
                        {t('hadith.spalteUebersetzer')}
                      </th>
                      <th scope="col" className="px-4 py-3 text-start">
                        {t('hadith.spalteStatus')}
                      </th>
                      <th scope="col" className="px-4 py-3 text-end">
                        <span className="sr-only">{t('hadith.spalteAktion')}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.zeilen.map((z) => (
                      <tr key={`${z.nummer}-${z.sprache}`} className="border-t border-linie align-top">
                        <th scope="row" className="px-4 py-3 text-start font-bold tabular-nums">
                          {z.nummer}
                        </th>
                        <td className="px-4 py-3">{sprache(z.sprache)}</td>
                        <td lang={z.sprache} className="max-w-md px-4 py-3 text-16">
                          <span className="line-clamp-2">{z.auszug}</span>
                        </td>
                        <td className="px-4 py-3 text-16">{z.uebersetzer}</td>
                        <td className="px-4 py-3">
                          <StatusPille status={z.status} />
                        </td>
                        <td className="px-4 py-3 text-end">{bearbeiten(z)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TabellenRahmen>
            )}
          </section>
        </>
      )}
    </div>
  );
}
