import type { JSONContent } from '@tiptap/core';
import { ArrowLeft, Eye, RotateCcw } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { PILLE } from '@/components/verwaltung/seiten/Ansichten';
import { ListenLeer } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { RichText } from '@/components/website/RichText';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { wissensRevisionWiederherstellen } from '@/server/actions/wissen';
import { ladeRevision, ladeRevisionen } from '@/server/queries/verwaltung/seiten';
import { ladeWissensThemaVerwaltung } from '@/server/queries/verwaltung/wissen';

const SPRACHEN = ['de', 'tr', 'en'] as const;
type Sprache = (typeof SPRACHEN)[number];
type Fassung = { titel?: unknown; kurztext?: unknown; inhalt?: unknown };

/** Wert eines Felds in einer Sprache: nur Text bzw. ein Tiptap-Dokument zählt, alles andere gilt als fehlend (Z-18). */
const objekt = (w: unknown): Record<string, unknown> | null =>
  w !== null && typeof w === 'object' && !Array.isArray(w) ? (w as Record<string, unknown>) : null;
const textIn = (feld: unknown, s: Sprache) => {
  const w = objekt(feld)?.[s];
  return typeof w === 'string' && w ? w : null;
};
const dokumentIn = (feld: unknown, s: Sprache) => {
  const w = objekt(objekt(feld)?.[s]);
  return w && w.type === 'doc' ? (w as JSONContent) : null;
};

/**
 * Verwaltung › Islamisches Wissen › Thema › Frühere Fassungen (F-40): die letzten 30 Revisionen; jede lässt sich lesen
 * (alle Sprachen, je mit `lang`) und zurückholen. Zurückholen übernimmt alle Sprachen der Fassung, ist eine inhaltliche
 * Änderung und geht in die religiöse Prüfung.
 */
export default async function WissenRevisionen({ params, searchParams }: PageProps<'/[locale]/verwaltung/wissen/[id]/revisionen'>) {
  await verlangeSeitenRecht('wissen.bearbeiten');
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const z = await ladeWissensThemaVerwaltung(id);
  if (!z) notFound();
  const [t, tg, liste] = await Promise.all([
    getTranslations('verwaltung.wissen'),
    getTranslations('verwaltung.shell'),
    ladeRevisionen('wissen_thema', z.id),
  ]);
  const gewaehlt = typeof sp.r === 'string' ? await ladeRevision(sp.r) : null;
  const ansicht = gewaehlt && gewaehlt.inhaltTyp === 'wissen_thema' && gewaehlt.inhaltId === z.id ? gewaehlt : null;
  const zeit = (d: Date) => `${datumLang(d, 'de')}, ${uhrzeit(d, 'de')}`;
  const darfZurueck = !z.imPapierkorbSeit;
  // Alte oder beschädigte Fassungen (kein Objekt) zeigen die Hinweise „fehlt“ statt abzustürzen
  const fassung: Fassung | null = ansicht ? (objekt(ansicht.inhalt) ?? {}) : null;

  return (
    <>
      <NextLink
        href={`/verwaltung/wissen/${z.id}`}
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('revision.zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={t('revision.titel')} kennung={tg('gruppe.inhalte')} einleitung={t('revision.einleitung')} />
      <p className="font-bold">{z.titel.de}</p>
      {liste.length === 0 ? (
        <ListenLeer text={t('revision.leer')} />
      ) : (
        <ol className="flex flex-col gap-3">
          {liste.map((r, i) => (
            <li
              key={r.id}
              className={cn(
                'flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border border-linie p-4 md:p-5',
                ansicht?.id === r.id ? 'bg-gruen-50' : 'bg-weiss',
              )}
            >
              <div className="flex min-w-0 flex-1 basis-72 flex-col gap-1">
                <p className="flex flex-wrap items-center gap-2 font-bold tabular-nums">
                  {zeit(r.erstelltAm)}
                  {i === 0 ? <span className={cn(PILLE, 'bg-gruen-50 text-gruen-800')}>{t('revision.aktuell')}</span> : null}
                  {r.kommentar === 'wiederhergestellt' ? (
                    <span className={cn(PILLE, 'bg-sand text-tinte-2')}>{t('revision.wiederhergestelltVermerk')}</span>
                  ) : null}
                </p>
                <p className="text-16 text-tinte-2">
                  {t('revision.spalteVon')}: {r.von ?? t('revision.unbekannt')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <NextLink
                    href={`/verwaltung/wissen/${z.id}/revisionen?r=${r.id}#ansicht`}
                    aria-label={t('revision.ansehen', { zeit: zeit(r.erstelltAm) })}
                  >
                    <Eye aria-hidden />
                    {t('revision.ansehenKurz')}
                  </NextLink>
                </Button>
                {darfZurueck && i > 0 ? (
                  <form action={wissensRevisionWiederherstellen}>
                    <input type="hidden" name="revisionId" value={r.id} />
                    <Button type="submit" variant="secondary" aria-label={t('revision.zurueckholenName', { zeit: zeit(r.erstelltAm) })}>
                      <RotateCcw aria-hidden />
                      {t('revision.zurueckholen')}
                    </Button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
      {ansicht && fassung ? (
        <section id="ansicht" aria-labelledby="ansicht-titel" className="flex flex-col gap-3">
          <h2 id="ansicht-titel" className="font-display text-24 font-semibold">
            {t('revision.ansichtTitel', { zeit: zeit(ansicht.erstelltAm) })}
          </h2>
          <Meldung art="info">{t('revision.ansichtHinweis')}</Meldung>
          {SPRACHEN.map((s) => {
            const titel = textIn(fassung.titel, s);
            const kurztext = textIn(fassung.kurztext, s);
            const doc = dokumentIn(fassung.inhalt, s);
            return (
              <section
                key={s}
                aria-labelledby={`ansicht-${s}`}
                className="flex flex-col gap-3 rounded-lg border border-linie bg-papier p-5 md:p-6"
              >
                <h3 id={`ansicht-${s}`} className="text-16 font-bold tracking-normal text-tinte-2">
                  {t(`revision.sprache.${s}`)}
                </h3>
                {titel || kurztext || doc ? (
                  <>
                    <div lang={s} className="flex flex-col gap-3">
                      {titel ? <p className="font-display text-24 font-semibold">{titel}</p> : null}
                      {kurztext ? <p className="text-18 text-tinte-2">{kurztext}</p> : null}
                      {doc ? <RichText doc={doc} /> : null}
                    </div>
                    {!titel || !kurztext || !doc ? (
                      <p className="text-16 text-tinte-2">
                        {t('revision.spracheTeilweise', {
                          felder: [
                            !titel && t('revision.feld.titel'),
                            !kurztext && t('revision.feld.kurztext'),
                            !doc && t('revision.feld.einfuehrung'),
                          ]
                            .filter(Boolean)
                            .join(', '),
                        })}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-16 text-tinte-2">{t('revision.spracheLeer')}</p>
                )}
              </section>
            );
          })}
        </section>
      ) : null}
    </>
  );
}
