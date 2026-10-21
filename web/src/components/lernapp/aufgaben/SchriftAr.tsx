'use client';

import { lazy, type ReactNode, Suspense, useMemo } from 'react';
import { buchstabeFuer, formen, zeichen } from '@/lib/elifbe/alphabet';
import { silbeFuer } from '@/lib/elifbe/silben';
import { schriftOptionen, schriftReihenfolge } from '@/lib/lernapp/aufgaben/schrift_ar';
import { formatiere } from '@/lib/lernapp/format';
import type { AufgabenProps } from '../typen';
import { Wahlgruppe } from './Wahlgruppe';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteSchriftAr as bewerte } from '@/lib/lernapp/aufgaben/schrift_ar';

/** Nachspuren mit Schreibweg und Glyphen als eigener Chunk (Glyphen und Züge ≈ 14 KB gz, nur bei `nachspuren`). */
const Nachspuren = lazy(() => import('./Nachspuren'));

const ARABISCH = 'font-arabic';

/**
 * Übungstyp `schrift_ar` (PLAN §4.4): Elifbe-Logik im Lektionsspieler. Buchstaben und Silben entstehen aus Codepunkten
 * (`lib/elifbe/alphabet.ts`, `silben.ts`), Namen aus `messages/lernapp` (`aufgaben2.schriftAr.namen`). Die gezeigte
 * Glyphe trägt nur eine neutrale Beschriftung (der Name wäre die Lösung). Nachspuren lädt erst bei Bedarf.
 */
export default function SchriftAr({
  aufgabe,
  weitere,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  antwort,
  setzeAntwort,
  gibAb,
}: AufgabenProps<'schrift_ar'>) {
  const t = weitere.aufgaben2.schriftAr;
  const g = weitere.aufgaben2.gemeinsam;
  const reihe = useMemo(() => schriftReihenfolge(aufgabe), [aufgabe]);
  const slugs = schriftOptionen(aufgabe);
  const b = buchstabeFuer(aufgabe.ziel);
  if (!b) return null;
  const umschrift = sprache === 'tr' ? 'tr' : 'de';

  if (aufgabe.art === 'nachspuren')
    return (
      <Suspense fallback={<p className="text-18 text-tinte-2">{t.laedt}</p>}>
        <Nachspuren
          buchstabe={b}
          name={t.namen[aufgabe.ziel]}
          texte={t}
          sprache={sprache}
          ziffern={ziffern}
          gesperrt={gesperrt}
          fertig={(spur) => gibAb({ typ: 'schrift_ar', spur })}
        />
      </Suspense>
    );

  let vorgabe: string;
  let beschriftung: string;
  let option: (slug: (typeof slugs)[number]) => ReactNode;
  if (aufgabe.art === 'erkennen') {
    vorgabe = zeichen(b);
    beschriftung = t.zeichen;
    option = (s) => t.namen[s];
  } else if (aufgabe.art === 'zuordnen') {
    const form = aufgabe.form ?? 'ende';
    vorgabe = formen(b)[form];
    beschriftung = formatiere(t.formZeichen, { form: t.form[form] }, sprache, ziffern);
    option = (s) => {
      const x = buchstabeFuer(s);
      return x ? (
        <span lang="ar" dir="rtl" className={`${ARABISCH} text-arabisch-2`}>
          {zeichen(x)}
        </span>
      ) : (
        s
      );
    };
  } else {
    const vokal = aufgabe.vokal ?? 'fatha';
    vorgabe = silbeFuer(aufgabe.ziel, vokal)?.text ?? zeichen(b);
    beschriftung = t.silbe;
    option = (s) => silbeFuer(s, vokal)?.umschrift[umschrift] ?? s;
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="flex justify-center rounded-lg bg-sand px-4 py-2">
        <span role="img" aria-label={beschriftung} lang="ar" dir="rtl" className={`${ARABISCH} buchstabe-riesig`}>
          {vorgabe}
        </span>
      </p>
      <Wahlgruppe
        legende={beschriftung}
        tasten={g.tasten}
        optionen={reihe.map((i) => ({ index: i, inhalt: option(slugs[i]!) }))}
        gewaehlt={antwort && 'wahl' in antwort ? antwort.wahl : null}
        richtig={auswertung ? 0 : null}
        gesperrt={gesperrt}
        setze={(wahl) => setzeAntwort({ typ: 'schrift_ar', wahl })}
        sprache={sprache}
        ziffern={ziffern}
        markeRichtig={g.richtigeAntwort}
        markeFalsch={g.deineAntwort}
      />
    </div>
  );
}
