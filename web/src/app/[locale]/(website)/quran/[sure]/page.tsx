import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { morphStil } from '@/components/website/morph';
import { LeserRahmen } from '@/components/website/quran/LeserRahmen';
import { QuellenFuss, Quellenzeile } from '@/components/website/quran/Quellenzeile';
import { QuranWeiter } from '@/components/website/quran/QuranWeiter';
import { SurenKopf } from '@/components/website/quran/SurenKopf';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { ausgabeFuer } from '@/lib/quran/ausgaben';
import { satzLaenge, versListeHtml, VOLLSATZ_GRENZE } from '@/lib/quran/satz';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { betriebsart } from '@/lib/umgebung';
import { ladeAusgaben, ladeQuranStand, ladeSure } from '@/server/queries/quran';

export const ensureStatic = 'navigation';

/** Alle 114 Suren beim Bau; ohne Import ein Platzhalter „_“ (antwortet mit 404). */
export async function generateStaticParams() {
  const { suren } = await ladeQuranStand();
  return suren.length ? suren.map((s) => ({ sure: String(s.nr) })) : [{ sure: '_' }];
}

/** Nur die kanonische Schreibweise gilt: „2“ ja, „02“ nein. */
function nummer(roh: string): number {
  return /^[1-9]\d{0,2}$/.test(roh) ? Number(roh) : Number.NaN;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; sure: string }> }): Promise<Metadata> {
  const nr = nummer((await params).sure);
  const sure = (await ladeQuranStand()).suren.find((s) => s.nr === nr);
  if (!sure) return {};
  const t = await getTranslations('quranSeite');
  return metadatenFuer({
    pfad: { pathname: '/quran/[sure]', params: { sure: String(nr) } },
    titel: t('titelSure', { name: sure.umschrift, nr }),
    beschreibung: t('untertitel'),
  });
}

/** Surenseite /quran/[sure] (O-Q01). URL-Daten nur innerhalb von Suspense lesen (MUSTER 1). */
export default function QuranSurePage({ params }: { params: Promise<{ locale: string; sure: string }> }) {
  return (
    <Suspense fallback={null}>
      <Sure params={params} />
    </Suspense>
  );
}

async function Sure({ params }: { params: Promise<{ locale: string; sure: string }> }) {
  const nr = nummer((await params).sure);
  const sprache = await getLocale();
  const t = await getTranslations('quranSeite');
  const { quelle, suren } = await ladeQuranStand();
  if (!quelle || !suren.some((s) => s.nr === nr)) notFound();
  // Übersetzung: freigegebene Ausgabe der Seitensprache; in Entwicklung/Vorschau auch ausstehende (mit Hinweis)
  const ausgaben = await ladeAusgaben(betriebsart(process.env) !== 'produktion');
  const ausgabe = ausgabeFuer(ausgaben, sprache);
  const sure = await ladeSure(nr, ausgabe?.id ?? null);
  if (!sure) notFound();
  const index = suren.findIndex((s) => s.nr === nr);
  const vorher = suren[index - 1];
  const naechste = suren[index + 1];
  const mitBasmala = Boolean(sure.basmala) && nr !== 1 && nr !== 9;

  return (
    <Seitenrahmen
      bereich="islam"
      seite="quran"
      sprachZiel={{ pathname: '/quran/[sure]', params: { sure: String(nr) } }}
      pfad={[{ label: t('breadcrumb'), ziel: '/quran' }, { label: sure.umschrift }]}
    >
      <SurenKopf
        kennung={t('sureNr', { nr })}
        nr={nr}
        nameAr={sure.nameAr}
        titel={sure.umschrift}
        medaillonStil={morphStil(`s-${nr}-bild`)}
        titelStil={morphStil(`s-${nr}-titel`, 'text')}
        angaben={
          <>
            {sure.ort ? <span aria-hidden>·</span> : null}
            {sure.ort ? <span>{t(`ort.${sure.ort}`)}</span> : null}
            <span aria-hidden>·</span>
            <span>{t('versAnzahl', { anzahl: sure.verseAnzahl })}</span>
          </>
        }
        quelle={<Quellenzeile quelle={quelle} />}
      />
      <LeserRahmen sure={nr} cuz={null} ausgaben={ausgaben} ausgabe={ausgabe}>
        <article aria-labelledby="sure-titel" className="rounded-lg border border-linie bg-weiss px-4 py-4 shadow-s1 md:px-10 md:py-8">
          {mitBasmala ? (
            <p lang="ar" dir="rtl" className="basmala">
              {sure.basmala}
            </p>
          ) : null}
          <ol
            aria-label={t('sure.verse')}
            data-sure={nr}
            lang={ausgabe?.sprache ?? sprache}
            className="verse"
            dangerouslySetInnerHTML={{ __html: versListeHtml(nr, sure.verse, false, satzLaenge(sure.verse) <= VOLLSATZ_GRENZE) }}
          />
        </article>
        <QuellenFuss ausgabe={ausgabe} />
        <QuranWeiter
          label={t('sure.blaettern')}
          vorher={vorher ? { ziel: { pathname: '/quran/[sure]', params: { sure: String(vorher.nr) } }, text: t('sure.navVorher'), name: `${vorher.nr} · ${vorher.umschrift}` } : null}
          naechste={
            naechste ? { ziel: { pathname: '/quran/[sure]', params: { sure: String(naechste.nr) } }, text: t('sure.navNaechste'), name: `${naechste.nr} · ${naechste.umschrift}` } : null
          }
        />
      </LeserRahmen>
    </Seitenrahmen>
  );
}
