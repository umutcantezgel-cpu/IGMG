import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Stern8 } from '@/components/website/Icons';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { arabischeZahl, VERSENDE } from '@/lib/quran/satz';
import type { DesTages as DesTagesDaten } from '@/server/queries/des-tages';

const LINK =
  'inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-800 underline underline-offset-4 hover:text-gruen-700';

/** Lange Texte (viele Hadithe) stehen kleiner – religiöse Texte werden nie gekürzt. */
function arabischGroesse(laenge: number): string {
  if (laenge <= 160) return 'text-arabisch-1';
  if (laenge <= 420) return 'text-arabisch-2';
  return 'text-arabisch-3';
}

function Karte({
  id,
  titel,
  arabisch,
  laenge,
  uebersetzung,
  quelle,
  link,
}: {
  id: string;
  titel: string;
  arabisch: ReactNode;
  laenge: number;
  uebersetzung: ReactNode;
  quelle: string;
  link: ReactNode;
}) {
  return (
    <article aria-labelledby={id} className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 shadow-s1 md:p-8">
      <h3 id={id} className="inline-flex items-center gap-2 text-20 font-bold text-gruen-800">
        <Stern8 className="size-4" />
        {titel}
      </h3>
      <figure className="flex flex-col gap-4">
        <blockquote lang="ar" dir="rtl" className={`font-arabic text-tinte ${arabischGroesse(laenge)}`}>
          {arabisch}
        </blockquote>
        {uebersetzung}
        <figcaption className="text-16 text-tinte-2">
          <cite className="font-bold text-tinte not-italic">{quelle}</cite>
        </figcaption>
      </figure>
      <div className="mt-auto">{link}</div>
    </article>
  );
}

/**
 * Vers und Hadith des Tages auf der Startseite (AUFTRAG 3.10, Kür K-A): nur, wenn die Liste „des Tages“ der
 * Verwaltung mindestens einen Eintrag hat. Arabisch aus dem Import (`lang="ar" dir="rtl"`), Übersetzung nur aus
 * freigegebenen Fassungen – sonst ein ehrlicher Hinweis. Versende und Ziffern aus Unicode-Codepunkten. Statisch.
 */
export async function DesTages({ daten, sprache }: { daten: DesTagesDaten; sprache: Locale }) {
  const { vers, hadith } = daten;
  if (!vers && !hadith) return null;
  const t = await getTranslations('desTages');
  const uebersetzung = (u: { text: string; quelle: string } | undefined) =>
    u ? (
      <div className="flex flex-col gap-1">
        <p className="text-20 leading-einleitung text-pretty">{u.text}</p>
        <p className="text-16 text-tinte-2">{t('uebersetzung', { quelle: u.quelle })}</p>
      </div>
    ) : (
      <p className="text-16 text-tinte-2">{t('keineUebersetzung')}</p>
    );
  const titel = vers && hadith ? t('titel') : vers ? t('versTitel') : t('hadithTitel');
  return (
    <section aria-labelledby="des-tages-titel" className="border-t border-linie bg-sand">
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 py-abschnitt md:px-8">
        <div className="flex max-w-einleitung flex-col gap-3">
          <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
            <Stern8 className="size-4" />
            {t('kennung')}
          </span>
          <h2 id="des-tages-titel" className="text-display-2">
            {titel}
          </h2>
          <p className="text-20 leading-einleitung text-pretty text-tinte-2">{t('text')}</p>
        </div>
        <div className={vers && hadith ? 'grid items-start gap-6 lg:grid-cols-2' : 'grid max-w-(--container-lesen) gap-6'}>
          {vers ? (
            <Karte
              id="vers-des-tages"
              titel={t('versTitel')}
              arabisch={vers.verse.map((v) => (
                <span key={v.nr}>
                  {v.textAr} {VERSENDE}
                  {arabischeZahl(v.nr)}
                </span>
              ))}
              laenge={vers.verse.reduce((n, v) => n + v.textAr.length, 0)}
              uebersetzung={uebersetzung(vers.uebersetzung[sprache])}
              quelle={t('versQuelle', { sure: vers.sureName, vers: String(vers.verse[0]?.nr ?? '') })}
              link={
                <Link href={{ pathname: '/quran/[sure]', params: { sure: String(vers.sure) } }} className={LINK}>
                  <span>{t('zumVers')}</span>
                  <ArrowRight aria-hidden className="size-5" />
                </Link>
              }
            />
          ) : null}
          {hadith ? (
            <Karte
              id="hadith-des-tages"
              titel={t('hadithTitel')}
              arabisch={hadith.textAr}
              laenge={hadith.textAr.length}
              uebersetzung={uebersetzung(hadith.uebersetzung[sprache])}
              quelle={t('hadithQuelle', { nummer: hadith.nummer })}
              link={
                <Link href="/hadith" className={LINK}>
                  <span>{t('zumHadith')}</span>
                  <ArrowRight aria-hidden className="size-5" />
                </Link>
              }
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
