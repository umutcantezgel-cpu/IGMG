import { BookOpen, Volume2 } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import type { PfadEintrag } from '@/components/website/Breadcrumbs';
import type { Ziel } from '@/components/website/navigation';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { QuranWeiter } from '@/components/website/quran/QuranWeiter';
import { StandHinweis } from '@/components/website/quran/StandHinweis';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import type { SeitenStand } from './stand';

/**
 * Surenseite /quran/[sure] (Blatt S13) als Lesesatz: arabischer Text rechtsläufig mit großzügiger Zeilenhöhe,
 * Übersetzung in Textbreite, Versnummern dezent. Die Suren-Liste steht links (am Telefon nach dem Text), Blättern am
 * Seitenende. Ohne importierte Quelle steht nur der Platzhalter; Audio hat noch keine Funktion und bleibt deaktiviert.
 */
export async function QuranAnsicht({ stand }: { stand: SeitenStand }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('quranSeite');
  const { nr, liste, quelle, sure } = stand;
  const sprachZiel: Ziel = { pathname: '/quran/[sure]', params: { sure: String(nr) } };
  const pfad: PfadEintrag[] = [{ label: t('breadcrumb'), ziel: '/quran' }, { label: stand.name }];
  const versAnzahl = sure ? String(sure.verseAnzahl) : '–';

  return (
    <Seitenrahmen bereich="islam" seite="quran" sprachZiel={sprachZiel} pfad={pfad}>
      <PageHeader kennung={t('eyebrow')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-12 px-4 pt-8 pb-abschnitt-klein md:px-8 md:pt-12">
        <div className="grid items-start gap-10 lg:grid-cols-3">
          <article aria-labelledby="sura-titel" className="flex min-w-0 flex-col gap-8 lg:col-span-2 lg:col-start-2">
            <header className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h2 id="sura-titel" lang={stand.arabisch ? 'ar' : undefined} className="text-display-2">
                  {stand.name}
                </h2>
                <p className="text-tinte-2">{t('zaehlung', { anzahl: versAnzahl })}</p>
                <StandHinweis quelle={quelle} />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-12 items-center gap-3 rounded-pill bg-sand px-5 font-bold text-tinte-2 disabled:cursor-not-allowed"
                >
                  <Volume2 aria-hidden className="size-5" />
                  {t('audioFolgt')}
                </button>
              </div>
            </header>

            {sure ? (
              <ol className="flex flex-col rounded-lg border border-linie bg-weiss shadow-s1">
                {sure.verse.map((vers, i) => {
                  const vermerk = vers.uebersetzung?.[sprache] ?? null;
                  return (
                    <li key={vers.nr} className={cn('flex flex-col gap-5 p-5 md:p-8', i > 0 && 'border-t border-linie')}>
                      <span className="inline-flex h-9 min-w-9 items-center justify-center self-start rounded-pill bg-sand px-2.5 text-16 font-bold text-tinte-2">
                        <span className="sr-only">{t('vers')} </span>
                        {vers.nr}
                      </span>
                      <p dir="rtl" lang="ar" className="text-start text-30 leading-loose md:text-36 md:leading-loose">
                        {vers.textAr}
                      </p>
                      <div className="flex max-w-text flex-col gap-2">
                        <h3 className="text-16 font-bold text-tinte-2">{t('uebersetzung')}</h3>
                        {vermerk ? (
                          <>
                            <p lang={sprache} className="text-18 leading-einleitung">
                              {vermerk.text}
                            </p>
                            <p className="text-16 text-tinte-2">{t('uebersetzungQuelle', { quelle: vermerk.quelle })}</p>
                          </>
                        ) : (
                          <p className="text-tinte-2">{t('uebersetzungPlatzhalter')}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div
                role="status"
                className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-rand bg-weiss px-6 py-12 text-center"
              >
                <BookOpen aria-hidden className="size-8 text-tinte-2" />
                <p className="font-bold">{t('platzhalter')}</p>
                <p className="text-16 text-tinte-2">{stand.name}</p>
              </div>
            )}
          </article>

          {/* Blättern direkt unter dem Lesetext: mobil vor der Surenliste (sonst bis zu 114 Einträge dazwischen),
              ab lg in der Lesespalte unter der Sure */}
          <div className="min-w-0 lg:col-span-2 lg:col-start-2">
            <QuranWeiter vorher={stand.vorher} naechste={stand.naechste} />
          </div>

          <nav aria-labelledby="suren-liste" className="flex flex-col gap-4 lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <h2 id="suren-liste" className="flex items-center gap-2.5 text-24">
              <BookOpen aria-hidden className="size-6 shrink-0 text-gruen-700" />
              {t('liste')}
            </h2>
            <ul className="flex flex-col gap-1">
              {liste.map((eintrag) => {
                const aktiv = eintrag.nr === nr;
                return (
                  <li key={eintrag.nr}>
                    <Link
                      href={{ pathname: '/quran/[sure]', params: { sure: String(eintrag.nr) } }}
                      aria-current={aktiv ? 'page' : undefined}
                      className={cn(
                        'flex min-h-12 items-center gap-3 rounded-md border-2 px-3 py-1.5 text-tinte no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-tinte active:scale-98',
                        aktiv ? 'border-gruen-700 bg-gruen-50' : 'border-transparent',
                      )}
                    >
                      <span
                        className={cn(
                          'inline-flex size-9 shrink-0 items-center justify-center rounded-pill text-16 font-bold',
                          aktiv ? 'bg-gruen-700 text-weiss' : 'bg-sand text-tinte-2',
                        )}
                      >
                        {eintrag.nr}
                      </span>
                      <span lang={eintrag.arabisch ? 'ar' : undefined} className="leading-snug font-bold break-words">
                        {eintrag.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </Seitenrahmen>
  );
}
