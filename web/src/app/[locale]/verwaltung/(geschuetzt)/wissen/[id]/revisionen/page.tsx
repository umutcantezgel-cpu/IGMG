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

type Fassung = { titel?: { de?: string }; kurztext?: { de?: string } | null; inhalt?: { de?: JSONContent } | null };

/**
 * Verwaltung › Islamisches Wissen › Thema › Frühere Fassungen (F-40): die letzten 30 Revisionen; jede lässt sich lesen
 * (deutsche Fassung) und zurückholen. Zurückholen ist eine inhaltliche Änderung und geht in die religiöse Prüfung.
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
  const fassung = ansicht ? (ansicht.inhalt as Fassung) : null;

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
          <div className="flex flex-col gap-3 rounded-lg border border-linie bg-papier p-5 md:p-6">
            <p className="font-display text-24 font-semibold">{fassung.titel?.de}</p>
            {fassung.kurztext?.de ? <p className="text-18 text-tinte-2">{fassung.kurztext.de}</p> : null}
            {fassung.inhalt?.de ? <RichText doc={fassung.inhalt.de} /> : null}
          </div>
        </section>
      ) : null}
    </>
  );
}
