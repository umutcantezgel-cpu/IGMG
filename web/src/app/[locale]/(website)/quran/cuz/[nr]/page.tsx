import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Medaillon } from '@/components/website/quran/Medaillon';
import { LeserRahmen } from '@/components/website/quran/LeserRahmen';
import { QuellenFuss } from '@/components/website/quran/Quellenzeile';
import { QuranWeiter } from '@/components/website/quran/QuranWeiter';
import { SurenKopf } from '@/components/website/quran/SurenKopf';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import { ausgabeFuer } from '@/lib/quran/ausgaben';
import { versListeHtml } from '@/lib/quran/satz';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { betriebsart } from '@/lib/umgebung';
import { ladeAusgaben, ladeCuz, ladeCuzBereiche, ladeQuranStand } from '@/server/queries/quran';

export const ensureStatic = 'navigation';

/** Alle 30 Cüz beim Bau; ohne Import ein Platzhalter „_“ (antwortet mit 404). */
export async function generateStaticParams() {
  const bereiche = await ladeCuzBereiche();
  return bereiche.length ? bereiche.map((b) => ({ nr: String(b.nr) })) : [{ nr: '_' }];
}

function nummer(roh: string): number {
  return /^[1-9]\d?$/.test(roh) ? Number(roh) : Number.NaN;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; nr: string }> }): Promise<Metadata> {
  const nr = nummer((await params).nr);
  if (!(await ladeCuzBereiche()).some((b) => b.nr === nr)) return {};
  const t = await getTranslations('quranSeite');
  return metadatenFuer({
    pfad: { pathname: '/quran/cuz/[nr]', params: { nr: String(nr) } },
    titel: t('titelCuz', { nr }),
    beschreibung: t('untertitel'),
  });
}

/**
 * Cüz /quran/cuz/[nr] (O-Q01): die Verse eines Cüz über Surengrenzen hinweg im selben Leser. Wie die Surenseite ohne
 * umschließendes `<Suspense>` (Abweichung von MUSTER 1, Begründung dort): alle 30 Cüz sind vorgerendert.
 */
export default async function QuranCuzPage({ params }: { params: Promise<{ locale: string; nr: string }> }) {
  const nr = nummer((await params).nr);
  const sprache = await getLocale();
  const t = await getTranslations('quranSeite');
  const [{ quelle }, bereiche] = await Promise.all([ladeQuranStand(), ladeCuzBereiche()]);
  const bereich = bereiche.find((b) => b.nr === nr);
  if (!quelle || !bereich) notFound();
  const ausgaben = await ladeAusgaben(betriebsart(process.env) !== 'produktion');
  const ausgabe = ausgabeFuer(ausgaben, sprache);
  const cuz = await ladeCuz(nr, ausgabe?.id ?? null);
  if (!cuz) notFound();
  const ziel = (n: number) => ({ pathname: '/quran/cuz/[nr]', params: { nr: String(n) } }) as const;

  return (
    <Seitenrahmen
      bereich="islam"
      seite="quran"
      sprachZiel={ziel(nr)}
      pfad={[{ label: t('breadcrumb'), ziel: '/quran' }, { label: t('cuz.titel', { nr }) }]}
      kompakteLeiste
    >
      <SurenKopf
        kennung={t('cuz.kennung', { nr })}
        nr={nr}
        titel={t('cuz.titel', { nr })}
        angaben={
          <span className="basis-full">
            {t('cuz.bereich', {
              vonSure: bereich.von.sure,
              vonVers: bereich.von.vers,
              bisSure: bereich.bis.sure,
              bisVers: bereich.bis.vers,
            })}
          </span>
        }
      />
      <LeserRahmen sure={null} cuz={nr} ausgaben={ausgaben} ausgabe={ausgabe}>
        {cuz.abschnitte.map(({ sure, verse }) => {
          const ganz = verse[0]?.nr === 1;
          return (
            <section
              key={sure.nr}
              aria-labelledby={`abschnitt-${sure.nr}`}
              className="rounded-lg border border-linie bg-weiss px-4 py-4 shadow-s1 md:px-10 md:py-8"
            >
              <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-linie pb-4">
                <Medaillon nr={sure.nr} groesse="mittel" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <h2 id={`abschnitt-${sure.nr}`} className="text-24">
                    {sure.umschrift}
                  </h2>
                  <p className="text-16 text-tinte-2">
                    {sure.ort ? `${t(`ort.${sure.ort}`)} · ` : ''}
                    {ganz ? t('versAnzahl', { anzahl: sure.verseAnzahl }) : t('cuz.ab', { vers: verse[0]?.nr ?? 1 })}
                  </p>
                </div>
                <p lang="ar" dir="rtl" className="font-quran text-arabisch-2 text-tinte">
                  {sure.nameAr}
                </p>
                <Link
                  href={{ pathname: '/quran/[sure]', params: { sure: String(sure.nr) } }}
                  prefetch={false}
                  className="inline-flex min-h-12 basis-full items-center text-16 font-bold md:basis-auto"
                >
                  {t('cuz.ganzeSure')}
                </Link>
              </header>
              {ganz && sure.basmala && sure.nr !== 1 && sure.nr !== 9 ? (
                <p lang="ar" dir="rtl" className="basmala">
                  {sure.basmala}
                </p>
              ) : null}
              <ol
                aria-labelledby={`abschnitt-${sure.nr}`}
                data-sure={sure.nr}
                lang={ausgabe?.sprache ?? sprache}
                start={verse[0]?.nr ?? 1}
                style={{ counterReset: `vers ${(verse[0]?.nr ?? 1) - 1}` }}
                className="verse"
                dangerouslySetInnerHTML={{ __html: versListeHtml(sure.nr, verse, true) }}
              />
            </section>
          );
        })}
        <QuellenFuss ausgabe={ausgabe} quelle={quelle} />
        <QuranWeiter
          label={t('cuz.blaettern')}
          vorher={nr > 1 ? { ziel: ziel(nr - 1), text: t('cuz.navVorher'), name: t('cuz.titel', { nr: nr - 1 }) } : null}
          naechste={nr < bereiche.length ? { ziel: ziel(nr + 1), text: t('cuz.navNaechste'), name: t('cuz.titel', { nr: nr + 1 }) } : null}
        />
      </LeserRahmen>
    </Seitenrahmen>
  );
}
