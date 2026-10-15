'use client';

import { BookOpen, BookOpenCheck, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSyncExternalStore } from 'react';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import {
  LESEZEICHEN_SCHLUESSEL,
  leseLesezeichen,
  leseWeiterlesen,
  ohneLesezeichen,
  WEITERLESEN_SCHLUESSEL,
  type Lesezeichen,
} from '@/lib/konto/lesezeichen';

/**
 * Koran-Lesezeichen dieses Geräts, wie sie der Koran-Leser speichert (`igmg-quran-lesezeichen`, Objekt oder Liste)
 * und die Stelle zum Weiterlesen (`igmg-quran-weiterlesen`). Nichts geht an den Server. Liest erst im Browser (auf
 * dem Server ist der Gerätespeicher unbekannt; reservierter Platz statt Flackern). Verweise wie im Leser: `#v<vers>`.
 */
const zuhoerer = new Set<() => void>();
function abonnieren(f: () => void) {
  zuhoerer.add(f);
  const beiSpeicher = (e: StorageEvent) => {
    if (e.key === LESEZEICHEN_SCHLUESSEL || e.key === WEITERLESEN_SCHLUESSEL || e.key === null) f();
  };
  window.addEventListener('storage', beiSpeicher);
  return () => {
    zuhoerer.delete(f);
    window.removeEventListener('storage', beiSpeicher);
  };
}
function lies(schluessel: string): string {
  try {
    return window.localStorage.getItem(schluessel) ?? '';
  } catch {
    return '';
  }
}
const TRENNER = '\u0001';
const AUF_DEM_SERVER = '\u0000';
/** Beide Werte als ein Schnappschuss (Zeichenkette, damit React gleiche Stände erkennt). */
const schnappschuss = () => `${lies(LESEZEICHEN_SCHLUESSEL)}${TRENNER}${lies(WEITERLESEN_SCHLUESSEL)}`;

export function LesezeichenListe({ sureLink, quranLink, namen }: { sureLink: string; quranLink: string; namen: Record<number, string> }) {
  const t = useTranslations('meinBereich.lesezeichen');
  const sprache = useLocale();
  const roh = useSyncExternalStore(abonnieren, schnappschuss, () => AUF_DEM_SERVER);
  const [lesezeichenRoh, weiterlesenRoh] = roh === AUF_DEM_SERVER ? ['', ''] : roh.split(TRENNER);
  const liste = roh === AUF_DEM_SERVER ? null : leseLesezeichen(lesezeichenRoh || null);
  const weiter = roh === AUF_DEM_SERVER ? null : leseWeiterlesen(weiterlesenRoh || null);
  const datum = new Intl.DateTimeFormat(sprache === 'tr' ? 'tr-TR' : sprache === 'en' ? 'en-GB' : 'de-DE', { dateStyle: 'medium' });
  const ziel = (z: Lesezeichen) => `${sureLink.replace('__SURE__', String(z.sure))}#v${z.vers}`;

  const entfernen = (z: Lesezeichen) => {
    try {
      const neu = ohneLesezeichen(leseLesezeichen(lies(LESEZEICHEN_SCHLUESSEL) || null), z);
      if (neu === null) window.localStorage.removeItem(LESEZEICHEN_SCHLUESSEL);
      else window.localStorage.setItem(LESEZEICHEN_SCHLUESSEL, neu);
    } catch {
      return;
    }
    for (const f of zuhoerer) f();
  };

  if (liste === null) return <div className="min-h-40" aria-busy="true" />;
  return (
    <div className="flex flex-col gap-4">
      {weiter ? (
        <a
          href={ziel(weiter)}
          className="flex min-h-12 druck items-center gap-4 rounded-lg border border-gruen-700 bg-gruen-50 px-4 py-3 text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-weiss hover:text-gruen-800"
        >
          <BookOpenCheck aria-hidden className="size-6 shrink-0" />
          <span className="flex min-w-0 flex-col">
            <span className="font-bold">{t('weiterlesen')}</span>
            <span className="text-16">{t('eintrag', { sure: weiter.sure, vers: weiter.vers })}</span>
          </span>
        </a>
      ) : null}
      {liste.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-rand bg-papier px-6 py-10 text-center">
          <Zustandsgrafik art="leer" />
          <p className="text-20 font-bold">{t('leer')}</p>
          <p className="max-w-text text-pretty text-tinte-2">{t('leerText')}</p>
          <a href={quranLink} className="inline-flex min-h-12 items-center gap-2 font-bold">
            <BookOpen aria-hidden className="size-5" />
            {t('zumQuran')}
          </a>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-linie rounded-lg border border-linie bg-weiss">
          {liste.map((z) => {
            const titel = t('eintrag', { sure: z.sure, vers: z.vers });
            return (
              <li key={`${z.sure}-${z.vers}-${z.zeit ?? ''}`} className="flex items-center gap-2 py-3 pr-2 pl-3 sm:gap-3 sm:px-4">
                <a
                  href={ziel(z)}
                  className="flex min-h-12 min-w-0 flex-1 items-center gap-3 text-tinte no-underline hover:text-gruen-800 sm:gap-4"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-gruen-50 font-bold text-gruen-800 tabular-nums">
                    {z.sure}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-bold">{titel}</span>
                      {namen[z.sure] ? (
                        <span lang="ar" dir="rtl" className="font-arabic text-20">
                          {namen[z.sure]}
                        </span>
                      ) : null}
                    </span>
                    {z.zeit !== undefined ? (
                      <span className="text-16 text-tinte-2">{t('gespeichert', { datum: datum.format(new Date(z.zeit)) })}</span>
                    ) : null}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => entfernen(z)}
                  aria-label={t('entfernenLabel', { eintrag: titel })}
                  className="inline-flex min-h-12 min-w-12 shrink-0 druck cursor-pointer items-center justify-center gap-2 rounded-md font-bold text-tinte-2 transition duration-(--dauer-rueckmeldung) hover:bg-sand hover:text-tinte sm:px-3"
                >
                  <X aria-hidden className="size-5" />
                  <span className="max-sm:sr-only">{t('entfernen')}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
