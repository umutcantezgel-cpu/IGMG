import { ArrowLeft, Eye, RotateCcw } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { FreieSeiteInhalt } from '@/components/website/bloecke/FreieSeiteInhalt';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { darf, organisationsFilter, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { gueltigeBloecke } from '@/lib/validierung/bloecke';
import { revisionWiederherstellen } from '@/server/actions/seiten';
import { seiteMitMedien } from '@/server/queries/seiten';
import { ladeRevision, ladeRevisionen, ladeSeiteFuerVerwaltung } from '@/server/queries/verwaltung/seiten';

type Momentaufnahme = { titel?: unknown; beschreibung?: unknown; bloecke?: unknown };

/** Momentaufnahme einer Fassung als Objekt; alles andere (alte oder beschädigte Fassung) ergibt `{}` statt eines Absturzes. */
const inhaltVon = (inhalt: unknown): Momentaufnahme =>
  inhalt !== null && typeof inhalt === 'object' && !Array.isArray(inhalt) ? (inhalt as Momentaufnahme) : {};

/** Mehrsprachiger Text mit deutschem Wortlaut, sonst null. */
function mehrsprachig<T extends { de: string }>(wert: unknown): T | null {
  return wert !== null && typeof wert === 'object' && typeof (wert as { de?: unknown }).de === 'string' ? (wert as T) : null;
}

/**
 * Verwaltung › Seite › Frühere Fassungen (ADR 0032): die letzten 30 Revisionen mit Zeit und Person; jede lässt sich
 * ansehen (gerenderte Bausteine) und zurückholen. Die neueste ist die aktuelle Fassung. Titel und Zahl der Bausteine je
 * Zeile kommen aus der Liste (`ladeRevisionen`), die gewählte Fassung aus `ladeRevision` (Z-18: früher las jede nicht
 * angesehene Zeile `null` und die Seite stürzte ab, sobald es eine Fassung gab).
 */
export default async function SeitenRevisionen({ params, searchParams }: PageProps<'/[locale]/verwaltung/seiten/[id]/revisionen'>) {
  const a = await verlangeSeitenRecht('seite.lesen');
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const z = await ladeSeiteFuerVerwaltung(id, organisationsFilter(a.rollen, 'seite.bearbeiten'));
  if (!z) notFound();
  const [t, tg, liste] = await Promise.all([
    getTranslations('verwaltung.seiten'),
    getTranslations('verwaltung.shell'),
    ladeRevisionen('seite', z.id),
  ]);
  const darfZurueck = darf(a.rollen, 'seite.bearbeiten', { organisation: z.organisation }) && !z.imPapierkorbSeit;
  const gewaehlt = typeof sp.r === 'string' ? await ladeRevision(sp.r) : null;
  const ansicht = gewaehlt && gewaehlt.inhaltTyp === 'seite' && gewaehlt.inhaltId === z.id ? gewaehlt : null;
  const zeit = (d: Date) => `${datumLang(d, 'de')}, ${uhrzeit(d, 'de')}`;
  const fassung = ansicht ? inhaltVon(ansicht.inhalt) : null;

  return (
    <>
      <NextLink
        href={`/verwaltung/seiten/${z.id}`}
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('revision.zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={t('revision.titel')} kennung={tg('gruppe.inhalte')} einleitung={t('revision.einleitung')} />
      <p className="font-bold">{z.titel.de}</p>
      {darfZurueck ? <Meldung art="info">{t('revision.wiederherstellenHinweis')}</Meldung> : null}
      {liste.length === 0 ? (
        <ListenLeer text={t('revision.leer')} />
      ) : (
        <TabellenRahmen beschriftung={t('revision.titel')}>
          <table className="w-full min-w-160 border-collapse text-left">
            <thead className="bg-sand">
              <tr>
                {(['spalteZeit', 'spalteVon', 'spalteInhalt', 'spalteAktionen'] as const).map((s) => (
                  <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                    {t(`revision.${s}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liste.map((r, i) => (
                <tr key={r.id} className={`border-t border-linie align-middle ${ansicht?.id === r.id ? 'bg-gruen-50' : ''}`}>
                  <th scope="row" className="px-4 py-3 font-bold tabular-nums">
                    {zeit(r.erstelltAm)}
                    {i === 0 ? (
                      <span className="ml-2 rounded-pill bg-gruen-50 px-3 py-0.5 text-16 text-gruen-800">{t('revision.aktuell')}</span>
                    ) : null}
                  </th>
                  <td className="px-4 py-3">{r.von ?? t('revision.unbekannt')}</td>
                  <td className="px-4 py-3 text-16 text-tinte-2">
                    {r.kommentar === 'wiederhergestellt' ? <span className="block">{t('revision.wiederhergestelltVermerk')}</span> : null}
                    {r.titelDe ? <span className="block font-bold text-tinte">{r.titelDe}</span> : null}
                    {r.bausteine !== null ? <span className="block">{t('revision.bausteine', { anzahl: r.bausteine })}</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm" className="min-h-12">
                        <NextLink
                          href={`/verwaltung/seiten/${z.id}/revisionen?r=${r.id}#ansicht`}
                          aria-label={t('revision.ansehen', { zeit: zeit(r.erstelltAm) })}
                        >
                          <Eye aria-hidden />
                          {t('revision.ansehenKurz')}
                        </NextLink>
                      </Button>
                      {darfZurueck && i > 0 ? (
                        <form action={revisionWiederherstellen}>
                          <input type="hidden" name="revisionId" value={r.id} />
                          <Button
                            type="submit"
                            variant="secondary"
                            size="sm"
                            className="min-h-12"
                            aria-label={t('revision.wiederherstellenName', { zeit: zeit(r.erstelltAm) })}
                          >
                            <RotateCcw aria-hidden />
                            {t('revision.wiederherstellen')}
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabellenRahmen>
      )}
      {ansicht && fassung ? (
        <section id="ansicht" aria-labelledby="ansicht-titel" className="flex flex-col gap-3">
          <h2 id="ansicht-titel" className="font-display text-24 font-semibold">
            {t('revision.ansichtTitel', { zeit: zeit(ansicht.erstelltAm) })}
          </h2>
          <p className="text-16 text-tinte-2">{t('revision.ansichtHinweis')}</p>
          <div className="overflow-hidden rounded-lg border border-linie bg-papier">
            <FreieSeiteInhalt
              eingebettet
              sprache="de"
              seite={await seiteMitMedien({
                ...z,
                titel: mehrsprachig<typeof z.titel>(fassung.titel) ?? z.titel,
                beschreibung: mehrsprachig<NonNullable<typeof z.beschreibung>>(fassung.beschreibung),
                bloecke: gueltigeBloecke(fassung.bloecke),
              })}
            />
          </div>
        </section>
      ) : null}
    </>
  );
}
