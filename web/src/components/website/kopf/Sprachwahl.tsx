'use client';

import { Check, Globe } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import NextLink from 'next/link';
import type { Locale } from '@/i18n/routing';
import { useAussenKlick } from './useAussenKlick';

/** Sprache mit fertiger Adresse derselben Seite (serverseitig über getPathname, Deutsch ohne Präfix – K-02). */
export type SprachEintrag = { code: Locale; kurz: string; name: string; href: string };

/**
 * Sprachumschalter ohne Flaggen (Laufbuch D-09): Kürzel + Eigenname. Wechselt auf dieselbe Seite
 * in der anderen Sprache (T4: „Sprachwechsel bleibt auf derselben Seite“).
 */
export function Sprachwahl({
  aktuell,
  sprachen,
  texte,
}: {
  aktuell: Locale;
  sprachen: SprachEintrag[];
  texte: { aendern: string; titel: string; titelZweit: string; weitere: string };
}) {
  const [offen, setOffen] = useState(false);
  const wurzel = useRef<HTMLDivElement>(null);
  const knopf = useRef<HTMLButtonElement>(null);
  const schliessen = useCallback((fokus: boolean) => {
    setOffen(false);
    if (fokus) knopf.current?.focus();
  }, []);
  useAussenKlick(wurzel, offen, schliessen);
  const kurz = sprachen.find((s) => s.code === aktuell)?.kurz ?? aktuell.toUpperCase();
  return (
    <div ref={wurzel} className="relative">
      <button
        ref={knopf}
        type="button"
        aria-expanded={offen}
        aria-controls="sprachwahl-liste"
        aria-label={texte.aendern}
        title={texte.aendern}
        onClick={() => setOffen((o) => !o)}
        className="inline-flex min-h-12 cursor-pointer items-center gap-1.5 rounded-md border border-rand bg-weiss px-3 text-16 font-bold text-tinte transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 active:scale-98 motion-reduce:active:scale-100"
      >
        <Globe aria-hidden className="size-5" />
        <span>{kurz}</span>
      </button>
      <div
        id="sprachwahl-liste"
        hidden={!offen}
        className="tritt-auf absolute top-full right-0 z-(--ebene-dialog) mt-3 flex w-75 flex-col gap-1 rounded-lg border border-linie bg-weiss p-2 shadow-s2"
      >
        <div className="flex items-start gap-2 rounded-md bg-gruen-50 px-3 py-2 text-gruen-800">
          <Globe aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span className="flex flex-col text-16 leading-snug">
            <strong>{texte.titel}</strong>
            <span lang={aktuell === 'en' ? 'de' : 'en'}>{texte.titelZweit}</span>
          </span>
        </div>
        <ul className="flex flex-col gap-1">
          {sprachen.map((s) => {
            const an = s.code === aktuell;
            return (
              <li key={s.code}>
                <NextLink
                  href={s.href}
                  prefetch={false}
                  lang={s.code}
                  hrefLang={s.code}
                  aria-current={an ? 'true' : undefined}
                  onClick={() => setOffen(false)}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-18 no-underline transition duration-(--dauer-rueckmeldung) ${an ? 'bg-gruen-100 text-gruen-800' : 'bg-weiss text-tinte hover:bg-gruen-50 hover:text-tinte'}`}
                >
                  <span className="inline-flex h-7 min-w-10 items-center justify-center rounded-sm border border-rand text-16 font-bold">
                    {s.kurz}
                  </span>
                  <span className="flex-1 font-bold">{s.name}</span>
                  {an ? <Check aria-hidden className="size-5 text-gruen-700" /> : null}
                </NextLink>
              </li>
            );
          })}
        </ul>
        <p className="mt-1 border-t border-linie px-3 pt-2 pb-1 text-center text-16 text-tinte-2">{texte.weitere}</p>
      </div>
    </div>
  );
}
